package guru.qa.allure.notifications.http;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpsConfigurator;
import com.sun.net.httpserver.HttpsServer;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

final class Socks5TestProxy implements Closeable {
    private static final int SOCKS_VERSION = 0x05;
    private static final int METHOD_NO_AUTH = 0x00;
    private static final int METHOD_USER_PASS = 0x02;
    private static final int METHOD_NONE_ACCEPTABLE = 0xFF;
    private static final int ATYP_IPV4 = 0x01;
    private static final int ATYP_DOMAIN = 0x03;
    private static final int ATYP_IPV6 = 0x04;

    private final ServerSocket serverSocket;
    private final ExecutorService executor;
    private final String username;
    private final String password;
    private final AtomicInteger connectCount = new AtomicInteger();

    private Socks5TestProxy(String username, String password) throws IOException {
        this.username = username;
        this.password = password;
        this.serverSocket = new ServerSocket(0, 50, InetAddress.getByName("127.0.0.1"));
        this.executor = Executors.newCachedThreadPool();
        this.executor.execute(this::acceptLoop);
    }

    static Socks5TestProxy noAuth() throws IOException {
        return new Socks5TestProxy(null, null);
    }

    static Socks5TestProxy withPassword(String username, String password) throws IOException {
        return new Socks5TestProxy(username, password);
    }

    int port() {
        return serverSocket.getLocalPort();
    }

    int connectCount() {
        return connectCount.get();
    }

    @Override
    public void close() throws IOException {
        serverSocket.close();
        executor.shutdownNow();
        try {
            executor.awaitTermination(2, TimeUnit.SECONDS);
        } catch (InterruptedException expected) {
            Thread.currentThread().interrupt();
        }
    }

    private void acceptLoop() {
        while (!serverSocket.isClosed()) {
            try {
                Socket client = serverSocket.accept();
                executor.execute(() -> handleClient(client));
            } catch (SocketException expected) {
                return;
            } catch (IOException expected) {
                return;
            }
        }
    }

    private void handleClient(Socket client) {
        Socket target = null;
        try {
            client.setSoTimeout(5000);
            InputStream in = client.getInputStream();
            OutputStream out = client.getOutputStream();
            greet(in, out);
            target = connectTarget(in, out);
            connectCount.incrementAndGet();
            relay(client, target);
        } catch (IOException expected) {
            // client or target closed
        } finally {
            closeQuietly(target);
            closeQuietly(client);
        }
    }

    private void greet(InputStream in, OutputStream out) throws IOException {
        int version = readByte(in);
        int methodCount = readByte(in);
        byte[] methods = new byte[methodCount];
        readFully(in, methods);
        if (version != SOCKS_VERSION) {
            throw new IOException("bad version");
        }
        boolean wantAuth = username != null;
        boolean offeredUserPass = contains(methods, (byte) METHOD_USER_PASS);
        boolean offeredNoAuth = contains(methods, (byte) METHOD_NO_AUTH);
        if (wantAuth && offeredUserPass) {
            out.write(new byte[] {(byte) SOCKS_VERSION, (byte) METHOD_USER_PASS});
            out.flush();
            authenticate(in, out);
        } else if (!wantAuth && offeredNoAuth) {
            out.write(new byte[] {(byte) SOCKS_VERSION, (byte) METHOD_NO_AUTH});
            out.flush();
        } else {
            out.write(new byte[] {(byte) SOCKS_VERSION, (byte) METHOD_NONE_ACCEPTABLE});
            out.flush();
            throw new IOException("no acceptable method");
        }
    }

    private void authenticate(InputStream in, OutputStream out) throws IOException {
        int authVersion = readByte(in);
        int userLength = readByte(in);
        byte[] userBytes = new byte[userLength];
        readFully(in, userBytes);
        int passLength = readByte(in);
        byte[] passBytes = new byte[passLength];
        readFully(in, passBytes);
        boolean ok = authVersion == 1
                && username.equals(new String(userBytes, StandardCharsets.UTF_8))
                && password.equals(new String(passBytes, StandardCharsets.UTF_8));
        out.write(new byte[] {(byte) 0x01, (byte) (ok ? 0 : 1)});
        out.flush();
        if (!ok) {
            throw new IOException("auth failed");
        }
    }

    private Socket connectTarget(InputStream in, OutputStream out) throws IOException {
        int version = readByte(in);
        int command = readByte(in);
        readByte(in);
        int addressType = readByte(in);
        String host = readAddress(in, addressType);
        int port = (readByte(in) << 8) | readByte(in);
        if (version != SOCKS_VERSION || command != 0x01) {
            writeConnectReply(out, 0x07);
            throw new IOException("unsupported command");
        }
        Socket target = new Socket();
        target.connect(new InetSocketAddress(host, port), 3000);
        writeConnectReply(out, 0x00);
        return target;
    }

    private static String readAddress(InputStream in, int addressType) throws IOException {
        if (addressType == ATYP_IPV4) {
            byte[] address = new byte[4];
            readFully(in, address);
            return InetAddress.getByAddress(address).getHostAddress();
        }
        if (addressType == ATYP_DOMAIN) {
            int length = readByte(in);
            byte[] name = new byte[length];
            readFully(in, name);
            return new String(name, StandardCharsets.US_ASCII);
        }
        if (addressType == ATYP_IPV6) {
            byte[] address = new byte[16];
            readFully(in, address);
            return InetAddress.getByAddress(address).getHostAddress();
        }
        throw new IOException("bad atyp");
    }

    private static void writeConnectReply(OutputStream out, int reply) throws IOException {
        out.write(new byte[] {
            (byte) SOCKS_VERSION, (byte) reply, 0, (byte) ATYP_IPV4, 0, 0, 0, 0, 0, 0
        });
        out.flush();
    }

    private static void relay(Socket left, Socket right) throws IOException {
        Thread forward = new Thread(() -> copy(left, right), "socks-relay-up");
        forward.setDaemon(true);
        forward.start();
        copy(right, left);
    }

    private static void copy(Socket from, Socket to) {
        try {
            InputStream in = from.getInputStream();
            OutputStream out = to.getOutputStream();
            byte[] buffer = new byte[4096];
            int read;
            while ((read = in.read(buffer)) >= 0) {
                out.write(buffer, 0, read);
                out.flush();
            }
        } catch (IOException expected) {
            closeQuietly(from);
            closeQuietly(to);
        }
    }

    static HttpServer startHttpEcho() throws IOException {
        HttpServer http = HttpServer.create(new InetSocketAddress(InetAddress.getByName("127.0.0.1"), 0), 0);
        http.createContext("/ping", exchange -> {
            byte[] body = "pong".getBytes(StandardCharsets.US_ASCII);
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        http.createContext("/photo", exchange -> {
            ByteArrayOutputStream sink = new ByteArrayOutputStream();
            copyStream(exchange.getRequestBody(), sink);
            boolean hasPhoto = sink.toString("ISO-8859-1").contains("chart.png");
            byte[] body = (hasPhoto ? "ok" : "missing-photo").getBytes(StandardCharsets.US_ASCII);
            exchange.sendResponseHeaders(hasPhoto ? 200 : 400, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        http.start();
        return http;
    }

    static HttpsServer startHttpsEcho(SSLContext sslContext) throws IOException {
        HttpsServer https = HttpsServer.create(new InetSocketAddress(InetAddress.getByName("127.0.0.1"), 0), 0);
        https.setHttpsConfigurator(new HttpsConfigurator(sslContext));
        https.createContext("/ping", exchange -> {
            byte[] body = "pong".getBytes(StandardCharsets.US_ASCII);
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        https.start();
        return https;
    }

    static SSLContext testSslContext() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        try (InputStream in = Socks5TestProxy.class.getResourceAsStream("localhost.p12")) {
            if (in == null) {
                throw new IOException("missing localhost.p12");
            }
            keyStore.load(in, "socks-test".toCharArray());
        }
        KeyManagerFactory keyManagers = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        keyManagers.init(keyStore, "socks-test".toCharArray());
        TrustManagerFactory trustManagers = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        trustManagers.init(keyStore);
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(keyManagers.getKeyManagers(), trustManagers.getTrustManagers(), null);
        return sslContext;
    }

    private static void copyStream(InputStream in, ByteArrayOutputStream sink) throws IOException {
        byte[] buffer = new byte[4096];
        int read;
        while ((read = in.read(buffer)) >= 0) {
            sink.write(buffer, 0, read);
        }
    }

    private static boolean contains(byte[] methods, byte method) {
        for (byte candidate : methods) {
            if (candidate == method) {
                return true;
            }
        }
        return false;
    }

    private static int readByte(InputStream in) throws IOException {
        int value = in.read();
        if (value < 0) {
            throw new IOException("eof");
        }
        return value;
    }

    private static void readFully(InputStream in, byte[] buffer) throws IOException {
        int offset = 0;
        while (offset < buffer.length) {
            int read = in.read(buffer, offset, buffer.length - offset);
            if (read < 0) {
                throw new IOException("eof");
            }
            offset += read;
        }
    }

    private static void closeQuietly(Socket socket) {
        if (socket == null) {
            return;
        }
        try {
            socket.close();
        } catch (IOException expected) {
            // already closed
        }
    }
}
