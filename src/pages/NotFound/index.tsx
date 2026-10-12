import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <Result
        status="404"
        title="404"
        subTitle="这个页面前端还没实现，或者链接已经失效"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            回到首页
          </Button>
        }
      />
    </div>
  )
}
