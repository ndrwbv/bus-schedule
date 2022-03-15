import React from 'react';

export default function ReactInlineSVG({ src }) {
  const id = src.split('.')[0]
  return <svg id={id} />;
}