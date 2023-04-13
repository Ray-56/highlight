// app/highlight.tsx
'use client'

import { H } from 'highlight.run'

H.init('1jdkoe52', {
	debug: {
		clientInteractions: true,
		domRecording: true,
	},
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
	},
	tracingOrigins: true,
	scriptUrl: 'http://localhost:8080/dist/index.js',
	backendUrl: 'https://localhost:8083/public',
})

const Highlight = () => {
	return null
}

export default Highlight
