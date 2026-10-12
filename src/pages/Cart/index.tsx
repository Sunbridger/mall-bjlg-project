import { useNavigate } from 'react-router-dom'
import { App, Button, Checkbox, Popconfirm, Tag } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useCart } from '@/store/cart'
import { useIsMobile } from '@/hooks/useResponsive'
import { formatAmount, formatPrice } from '@/utils/format'
import { handleImageError } from '@/utils/image'
import { QuantityStepper } from '@/components/QuantityStepper'
import { EmptyState } from '@/components/EmptyState'
import './Cart.less'

export default function Cart() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { modal } = App.useApp()
  const {
    lines,
    summary,
    removeItem,
    setQuantity,
    toggleItem,
    toggleAll,
    removeSelected,
    clear,
    lastAddedKey,
  } = useCart()

  const handleCheckout = () => {
    if (summary.selectedCount === 0) return
    modal.info({
      title: '演示环境，无法下单',
      centered: true,
      okText: '我知道了',
      content: (
        <div className="cart__modal">
          <p>本项目为纯前端演示，不接入真实支付与订单系统。</p>
          <ul>
            <li>已选商品：{summary.selectedCount} 件</li>
            <li>合计金额：{formatPrice(summary.selectedAmount)}</li>
          </ul>
          <p>真实项目在此处会跳到收银台。</p>
        </div>
      ),
    })
  }

  if (lines.length === 0) {
    return (
      <div className="cart page">
        <EmptyState
          description="购物车还是空的"
          extra={
            <>
              <Button type="primary" onClick={() => navigate('/')}>
                去逛逛
              </Button>
              <Button onClick={() => navigate('/category')}>浏览分类</Button>
            </>
          }
        />
      </div>
    )
  }

  const summaryBar = (
    <div className="cart__summary">
      <Checkbox
        checked={summary.allSelected}
        indeterminate={summary.selectedCount > 0 && !summary.allSelected}
        onChange={(e) => toggleAll(e.target.checked)}
      >
        全选
      </Checkbox>

      <div className="cart__summary-right">
        <div className="cart__total">
          <span className="cart__total-label">
            已选 <strong>{summary.selectedCount}</strong> 件，合计
          </span>
          <span className="cart__total-price">{formatPrice(summary.selectedAmount)}</span>
        </div>
        <Button type="primary" size="large" disabled={summary.selectedCount === 0} onClick={handleCheckout}>
          去结算
        </Button>
      </div>
    </div>
  )

  return (
    <div className="cart page">
      <header className="cart__head">
        <h2 className="cart__title">
          购物车
          <span className="cart__count">共 {summary.count} 件商品</span>
        </h2>
        <div className="cart__head-actions">
          <Popconfirm
            title="删除选中的商品？"
            okText="删除"
            cancelText="取消"
            onConfirm={removeSelected}
            disabled={summary.selectedCount === 0}
          >
            <Button type="text" disabled={summary.selectedCount === 0}>
              删除选中
            </Button>
          </Popconfirm>
          <Popconfirm title="清空购物车？" okText="清空" cancelText="取消" onConfirm={clear}>
            <Button type="text" danger>
              清空
            </Button>
          </Popconfirm>
        </div>
      </header>

      <div className="cart__list">
        {lines.map((line) => (
          <div
            className={`cart-line${line.key === lastAddedKey ? ' is-new' : ''}`}
            key={line.key}
          >
            <Checkbox
              className="cart-line__check"
              checked={line.selected}
              aria-label={`选择 ${line.product.name}`}
              onChange={() => toggleItem(line.key)}
            />

            <button
              type="button"
              className="cart-line__media"
              onClick={() => navigate(`/product/${line.product.id}`)}
            >
              <img
                src={line.product.images[0]}
                alt={line.product.name}
                loading="lazy"
                onError={handleImageError(`mall-${line.product.id}-0`)}
              />
            </button>

            <div className="cart-line__body">
              <button
                type="button"
                className="cart-line__name"
                onClick={() => navigate(`/product/${line.product.id}`)}
              >
                {line.product.name}
              </button>

              <div className="cart-line__tags">
                <Tag bordered={false}>{line.product.brand}</Tag>
                {line.specText && <span className="cart-line__spec">{line.specText}</span>}
              </div>

              <div className="cart-line__bottom">
                <span className="cart-line__price">{formatPrice(line.product.price)}</span>
                <div className="cart-line__ops">
                  <QuantityStepper
                    size="small"
                    value={line.quantity}
                    max={Math.max(1, Math.min(line.product.stock, 99))}
                    onChange={(value) => setQuantity(line.key, value)}
                  />
                  <Popconfirm
                    title="移出购物车？"
                    okText="移出"
                    cancelText="取消"
                    onConfirm={() => removeItem(line.key)}
                  >
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label="删除" />
                  </Popconfirm>
                </div>
              </div>
            </div>

            <div className="cart-line__subtotal">
              {formatPrice(line.product.price * line.quantity)}
            </div>
          </div>
        ))}
      </div>

      {!isMobile && (
        <div className="cart__checkout">
          {summaryBar}
          {summary.savedAmount > 0 && (
            <p className="cart__saved">已为你节省 ¥{formatAmount(summary.savedAmount)}</p>
          )}
        </div>
      )}

      {isMobile && <div className="cart__bar safe-bottom">{summaryBar}</div>}
    </div>
  )
}
