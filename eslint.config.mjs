import coreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...coreWebVitals,
  {
    ignores: ['tsconfig.tsbuildinfo', 'tsconfig.tsbuildinfo.*'],
  },
]

export default config
