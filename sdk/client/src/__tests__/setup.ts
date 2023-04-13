import { vi } from 'vitest'

// Mock consts:* imports provided via rollup-plugin-consts
vi.mock('consts:publicGraphURI', () => ({ default: 'localhost:8083' }))
