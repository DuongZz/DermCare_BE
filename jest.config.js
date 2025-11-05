export const preset = 'ts-jest'
export const testEnvironment = 'node'
export const roots = ['<rootDir>/tests']
export const transform = {
  '^.+\\.tsx?$': 'ts-jest',
}
export const testRegex = '((\\.|/)(test|spec))\\.tsx?$'
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
