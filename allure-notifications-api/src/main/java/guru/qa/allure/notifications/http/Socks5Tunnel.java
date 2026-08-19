package guru.qa.allure.notifications.http;

import guru.qa.allure.notifications.config.proxy.Proxy;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

/**
 * RFC 1928 CONNECT + optional RFC 1929 username/password.
 * Apache {@code setProxy(HttpHost)} always speaks HTTP CONNECT, even with scheme {@code socks}.
 */
final class Socks5Tunnel {
    private static final int SOCKS_VERSION = 0x05;
    private static final int METHOD_NO_AUTH = 0x00;
    private static final int METHOD_USER_PASS = 0x02;
    private static final int METHOD_NONE_ACCEPTABLE = 0xFF;
    private static final int CMD_CONNECT = 0x01;
    private static final int ATYP_IPV4 = 0x01;
    private static final int ATYP_DOMAIN = 0x03;
    private static final int ATYP_IPV6 = 0x04;
    private static final int AUTH_VERSION = 0x01;
    private static final int MAX_DOMAIN_LENGTH = 255;

    private Socks5Tunnel() {
    }

    static Socket open(Proxy proxy, String targetHost, int targetPort, int connectTimeoutMs)
            throws IOException {
        Socket socket = new Socket();
        int timeout = connectTimeoutMs > 0 ? connectTimeoutMs : 15000;
        socket.connect(new InetSocketAddress(proxy.getHost(), proxy.getPort()), timeout);
        socket.setSoTimeout(timeout);
        try {
            handshake(socket, targetHost, targetPort, proxy.getUsername(), proxy.getPassword());
            socket.setSoTimeout(0);
            return socket;
        } catch (IOException ex) {
            socket.close();
            throw ex;
        }
    }

    private static void handshake(
            Socket socket,
            String targetHost,
            int targetPort,
            String username,
            String password) throws IOException {
        InputStream in = socket.getInputStream();
        OutputStream out = socket.getOutputStream();
        boolean auth = StringUtils.isNotEmpty(username) && StringUtils.isNotEmpty(password);
        if (auth) {
            out.write(new byte[] {
                (byte) SOCKS_VERSION, 2, (byte) METHOD_NO_AUTH, (byte) METHOD_USER_PASS
            });
        } else {
            out.write(new byte[] {(byte) SOCKS_VERSION, 1, (byte) METHOD_NO_AUTH});
        }
        out.flush();

        int version = readByte(in);
        int method = readByte(in);
        if (version != SOCKS_VERSION) {
            throw new IOException("SOCKS5 greeting: unexpected version " + version);
        }
        if (method == METHOD_NONE_ACCEPTABLE) {
            throw new IOException("SOCKS5 proxy rejected offered auth methods");
        }
        if (method == METHOD_USER_PASS) {
            if (!auth) {
                throw new IOException("SOCKS5 proxy requested username/password but none configured");
            }
            writeUserPass(out, username, password);
            out.flush();
            int authVersion = readByte(in);
            int status = readByte(in);
            if (authVersion != AUTH_VERSION || status != 0) {
                throw new IOException("SOCKS5 proxy authentication failed");
            }
        } else if (method != METHOD_NO_AUTH) {
            throw new IOException("SOCKS5 proxy selected unsupported method " + method);
        }

        writeConnect(out, targetHost, targetPort);
        out.flush();
        readConnectReply(in);
    }

    private static void writeUserPass(OutputStream out, String username, String password)
            throws IOException {
        byte[] userBytes = username.getBytes(StandardCharsets.UTF_8);
        byte[] passBytes = password.getBytes(StandardCharsets.UTF_8);
        if (userBytes.length > MAX_DOMAIN_LENGTH || passBytes.length > MAX_DOMAIN_LENGTH) {
            throw new IOException("SOCKS5 username/password longer than 255 bytes");
        }
        out.write(AUTH_VERSION);
        out.write(userBytes.length);
        out.write(userBytes);
        out.write(passBytes.length);
        out.write(passBytes);
    }

    private static void writeConnect(OutputStream out, String targetHost, int targetPort)
            throws IOException {
        out.write(SOCKS_VERSION);
        out.write(CMD_CONNECT);
        out.write(0);
        byte[] ipv4 = parseIpv4(targetHost);
        if (ipv4 != null) {
            out.write(ATYP_IPV4);
            out.write(ipv4);
        } else if (isIpv6Literal(targetHost)) {
            out.write(ATYP_IPV6);
            out.write(InetAddress.getByName(targetHost).getAddress());
        } else {
            byte[] hostBytes = targetHost.getBytes(StandardCharsets.US_ASCII);
            if (hostBytes.length == 0 || hostBytes.length > MAX_DOMAIN_LENGTH) {
                throw new IOException("SOCKS5 domain name length invalid: " + hostBytes.length);
            }
            out.write(ATYP_DOMAIN);
            out.write(hostBytes.length);
            out.write(hostBytes);
        }
        out.write((targetPort >>> 8) & 0xFF);
        out.write(targetPort & 0xFF);
    }

    private static void readConnectReply(InputStream in) throws IOException {
        int version = readByte(in);
        int reply = readByte(in);
        readByte(in);
        int addressType = readByte(in);
        skipBoundAddress(in, addressType);
        if (version != SOCKS_VERSION) {
            throw new IOException("SOCKS5 CONNECT: unexpected version " + version);
        }
        if (reply != 0) {
            throw new IOException("SOCKS5 CONNECT failed, reply code " + reply);
        }
    }

    private static void skipBoundAddress(InputStream in, int addressType) throws IOException {
        if (addressType == ATYP_IPV4) {
            readFully(in, 4 + 2);
        } else if (addressType == ATYP_IPV6) {
            readFully(in, 16 + 2);
        } else if (addressType == ATYP_DOMAIN) {
            int length = readByte(in);
            readFully(in, length + 2);
        } else {
            throw new IOException("SOCKS5 CONNECT: unsupported ATYP " + addressType);
        }
    }

    static byte[] parseIpv4(String host) {
        if (host == null) {
            return null;
        }
        String[] parts = host.split("\\.", -1);
        if (parts.length != 4) {
            return null;
        }
        byte[] address = new byte[4];
        for (int i = 0; i < 4; i++) {
            int octet;
            try {
                octet = Integer.parseInt(parts[i]);
            } catch (NumberFormatException expected) {
                return null;
            }
            if (octet < 0 || octet > 255 || !parts[i].equals(Integer.toString(octet))) {
                return null;
            }
            address[i] = (byte) octet;
        }
        return address;
    }

    private static boolean isIpv6Literal(String host) {
        return host != null && host.indexOf(':') >= 0;
    }

    private static int readByte(InputStream in) throws IOException {
        int value = in.read();
        if (value < 0) {
            throw new IOException("SOCKS5 proxy closed the connection");
        }
        return value;
    }

    private static void readFully(InputStream in, int length) throws IOException {
        int remaining = length;
        while (remaining > 0) {
            long skipped = in.skip(remaining);
            if (skipped > 0) {
                remaining -= (int) skipped;
                continue;
            }
            if (in.read() < 0) {
                throw new IOException("SOCKS5 proxy closed the connection");
            }
            remaining--;
        }
    }
}
