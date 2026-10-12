import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from '@/store/cart'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AppRoutes } from '@/router'

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#ff4d4f',
          colorLink: '#ff4d4f',
          borderRadius: 8,
          fontSize: 14,
        },
        components: {
          Button: { controlHeightLG: 44 },
        },
      }}
    >
      {/* antd 的 App 提供 message / modal / notification 的上下文 */}
      <AntdApp>
        <BrowserRouter>
          <CartProvider>
            <ScrollToTop />
            <AppRoutes />
          </CartProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  )
}
