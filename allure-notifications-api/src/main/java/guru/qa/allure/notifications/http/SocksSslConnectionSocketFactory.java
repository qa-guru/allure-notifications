package guru.qa.allure.notifications.http;

import guru.qa.allure.notifications.config.proxy.Proxy;
import org.apache.http.HttpHost;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.protocol.HttpContext;

import javax.net.ssl.SSLContext;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;

final class SocksSslConnectionSocketFactory extends SSLConnectionSocketFactory {
    private final Proxy proxy;

    SocksSslConnectionSocketFactory(Proxy proxy, SSLContext sslContext) {
        super(sslContext);
        this.proxy = proxy;
    }

    @Override
    public Socket createSocket(HttpContext context) {
        return new Socket();
    }

    @Override
    public Socket connectSocket(
            int connectTimeout,
            Socket socket,
            HttpHost host,
            InetSocketAddress remoteAddress,
            InetSocketAddress localAddress,
            HttpContext context) throws IOException {
        closeQuietly(socket);
        String target = Socks5Tunnel.destinationHost(host, remoteAddress);
        Socket tunneled = Socks5Tunnel.open(proxy, target, host.getPort(), connectTimeout);
        return createLayeredSocket(tunneled, target, host.getPort(), context);
    }

    private static void closeQuietly(Socket socket) {
        if (socket == null || socket.isClosed()) {
            return;
        }
        try {
            socket.close();
        } catch (IOException expected) {
            // placeholder socket from createSocket() is unused for the tunnel
        }
    }
}
