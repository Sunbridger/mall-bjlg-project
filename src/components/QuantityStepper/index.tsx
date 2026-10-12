import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { MAX_QUANTITY } from '@/store/cartReducer'
import './index.less'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  /** 尺寸，购物车行内用小号 */
  size?: 'small' | 'middle'
}

export function QuantityStepper({ value, onChange, min = 1, max = MAX_QUANTITY, size = 'middle' }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <div className={`stepper stepper--${size}`}>
      <button
        type="button"
        className="stepper__btn"
        disabled={value <= min}
        aria-label="减少数量"
        onClick={() => onChange(clamp(value - 1))}
      >
        <MinusOutlined />
      </button>

      <input
        className="stepper__input"
        type="text"
        inputMode="numeric"
        value={value}
        aria-label="商品数量"
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, '')
          if (raw === '') return
          onChange(clamp(Number(raw)))
        }}
        onBlur={(e) => {
          if (e.target.value === '') onChange(min)
        }}
      />

      <button
        type="button"
        className="stepper__btn"
        disabled={value >= max}
        aria-label="增加数量"
        onClick={() => onChange(clamp(value + 1))}
      >
        <PlusOutlined />
      </button>
    </div>
  )
}
