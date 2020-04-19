import { reactive } from '@vue/composition-api'

type SwipeDirection = 'left' | 'right' | 'none'

export interface SwipeDetectorState {
  /** 最後にタッチで移動があったX座標 */
  lastTouchPosX: number

  /** 最後にタッチで移動があったY座標 (開始判定のみに使用) */
  lastTouchPosY: number

  /** X移動量 */
  swipeDistanceX: number

  /** X速度 */
  swipeSpeedX: number

  /** スワイプ中か */
  swipeDirection: SwipeDirection

  /** スワイプを開始の判定途中か */
  isStartingSwipe: boolean
}

/**
 * x方向のスワイプを検出する
 */
const useSwipeDetector = () => {
  const state: SwipeDetectorState = reactive({
    lastTouchPosX: -1,
    lastTouchPosY: -1,
    swipeDistanceX: 0,
    swipeSpeedX: 0,
    swipeDirection: 'none',
    isStartingSwipe: false
  })

  const touchstartHandler = (e: TouchEvent) => {
    if (e.touches.length !== 1) return
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    state.lastTouchPosX = x
    state.lastTouchPosY = y
    state.swipeDistanceX = 0
    state.swipeSpeedX = 0
    state.isStartingSwipe = true
  }

  const touchendHandler = (e: TouchEvent) => {
    state.lastTouchPosX = -1
    state.lastTouchPosY = -1
    state.isStartingSwipe = false
    state.swipeDirection = 'none'
  }

  /** 横方向へのスワイプを開始するか判定する */
  const checkSwipeStarted = (e: TouchEvent) => {
    if (
      e.touches.length !== 1 ||
      state.lastTouchPosX < 0 ||
      state.lastTouchPosY < 0
    ) {
      return
    }
    const diffX = e.touches[0].clientX - state.lastTouchPosX
    const diffY = e.touches[0].clientY - state.lastTouchPosY
    const deg = Math.atan2(diffY, diffX)
    const normalizedDeg = Math.abs(((deg / Math.PI / 2) * 360) % 180)
    const isHorizontalScroll =
      (0 <= normalizedDeg && normalizedDeg < 30) ||
      (150 < normalizedDeg && normalizedDeg <= 180)
    state.isStartingSwipe = false
    state.swipeDirection = !isHorizontalScroll
      ? 'none'
      : diffX > 0
      ? 'right'
      : 'left'
  }

  const touchmoveHandler = (e: TouchEvent) => {
    if (state.isStartingSwipe) {
      checkSwipeStarted(e)
      return
    }
    if (state.swipeDirection === 'none') {
      return
    }
    e.stopPropagation()
    if (e.touches.length !== 1) return
    const x = e.touches[0].clientX
    const dx = x - state.lastTouchPosX
    state.swipeSpeedX = dx
    state.swipeDistanceX = state.swipeDistanceX + dx
    state.lastTouchPosX = x
  }
  return {
    swipeDetectorState: state,
    touchstartHandler,
    touchendHandler,
    touchmoveHandler
  }
}

export default useSwipeDetector
