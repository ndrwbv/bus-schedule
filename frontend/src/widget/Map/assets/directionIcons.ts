/**
 * Стрелка курса live-автобуса (specs/14-live-bus-direction.md).
 * 64×64, центр совпадает с центром иконки автобуса (40×40, радиус кружка 20).
 * Треугольник у верхнего края: при повороте вокруг центра он обходит кружок снаружи
 * и не закрывает сам автобус.
 */
export const ARROW_SVG = `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 1 L44 16 Q32 12 20 16 Z" fill="#FF6B35" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
</svg>`
