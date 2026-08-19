package guru.qa.allure.notifications.http;

import guru.qa.allure.notifications.config.proxy.Proxy;
import org.apache.http.HttpHost;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.protocol.HttpContext;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;

final class SocksPlainConnectionSocketFactory implements ConnectionSocketFactory {
    private final Proxy proxy;

    SocksPlainConnectionSocketFactory(Proxy proxy) {
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
        return Socks5Tunnel.open(proxy, host.getHostName(), host.getPort(), connectTimeout);
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
