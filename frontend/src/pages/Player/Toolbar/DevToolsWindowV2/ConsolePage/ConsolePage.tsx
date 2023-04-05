import LoadingBox from '@components/LoadingBox'
import { useGetLogsQuery } from '@graph/hooks'
import * as Types from '@graph/schemas'
import { LogLevel as LogLevelGraphQL } from '@graph/schemas'
import { ConsoleMessage } from '@highlight-run/client'
import { playerMetaData } from '@highlight-run/rrweb-types'
import { Box, Text } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { COLOR_MAPPING, FORMAT } from '@pages/LogsPage/constants'
import { EmptyDevToolsCallout } from '@pages/Player/Toolbar/DevToolsWindowV2/EmptyDevToolsCallout/EmptyDevToolsCallout'
import { LogLevel, Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import _ from 'lodash'
import moment from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { styledVerticalScrollbar } from 'style/common.css'

import { useReplayerContext } from '../../../ReplayerContext'
import * as styles from './style.css'

interface ParsedMessage extends ConsoleMessage {
	selected?: boolean
	id: number
}

export const ConsolePage = ({
	autoScroll,
	filter,
	logLevel,
	time,
}: {
	autoScroll: boolean
	filter: string
	logLevel: LogLevel
	time: number
}) => {
	const { projectId } = useProjectId()
	const [currentMessage, setCurrentMessage] = useState(-1)
	const { session, setTime, sessionMetadata, isPlayerReady } =
		useReplayerContext()
	const [parsedMessages, setParsedMessages] = useState<
		undefined | Array<ParsedMessage>
	>([])
	const { session_secure_id } = useParams<{ session_secure_id: string }>()

	const now = Date.now()
	const startDate = session?.created_at ?? moment(now)

	const { data, loading } = useGetLogsQuery({
		variables: {
			project_id: projectId,
			direction: Types.LogDirection.Asc,
			params: {
				query: `secure_session_id:${session_secure_id}`,
				date_range: {
					end_date: moment(startDate).add(4, 'hours').format(FORMAT),
					start_date: moment(startDate).format(FORMAT),
				},
			},
		},
		fetchPolicy: 'no-cache',
		skip: !session_secure_id,
	})

	useEffect(() => {
		setParsedMessages(
			data?.logs.edges?.map((edge: Types.LogEdge, i) => {
				const time = new Date(edge.node.timestamp).getTime()
				return {
					value: edge.node.message,
					selected: false,
					time,
					type: edge.node.level,
					id: i,
				}
			}) ?? [],
		)
	}, [data?.logs])

	// Logic for scrolling to current entry.
	useEffect(() => {
		if (parsedMessages?.length) {
			let msgIndex = 0
			let msgDiff: number = Number.MAX_VALUE
			for (let i = 0; i < parsedMessages.length; i++) {
				const currentDiff: number =
					time - (parsedMessages[i].time - parsedMessages[0].time)
				if (currentDiff < 0) break
				if (currentDiff < msgDiff) {
					msgIndex = i
					msgDiff = currentDiff
				}
			}
			setCurrentMessage(msgIndex)
		}
	}, [time, parsedMessages])

	const messagesToRender = useMemo(() => {
		const currentMessages = parsedMessages?.filter((m) => {
			// if the console type is 'all', let all messages through. otherwise, filter.
			if (logLevel === LogLevel.All) {
				return true
			} else if (m.type === logLevel.toLowerCase()) {
				return true
			}
			return false
		})

		if (!currentMessages) {
			return []
		}

		if (filter !== '') {
			return currentMessages.filter((message) => {
				if (!message.value) {
					return false
				}

				switch (typeof message.value) {
					case 'string':
						return message.value
							.toLocaleLowerCase()
							.includes(filter.toLocaleLowerCase())
					case 'object':
						return message.value.some((line: string | null) => {
							return line
								?.toString()
								.toLocaleLowerCase()
								.includes(filter.toLocaleLowerCase())
						})
					default:
						return false
				}
			})
		}

		return currentMessages.filter((message) => message?.value?.length)
	}, [logLevel, filter, parsedMessages])

	const virtuoso = useRef<VirtuosoHandle>(null)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.debounce((index: number) => {
			if (virtuoso.current) {
				virtuoso.current.scrollToIndex({
					index,
					align: 'center',
					behavior: 'smooth',
				})
			}
		}, 1000 / 60),
		[],
	)

	useEffect(() => {
		if (autoScroll) {
			scrollFunction(currentMessage)
		}
	}, [autoScroll, scrollFunction, currentMessage])

	return (
		<Box className={styles.consoleBox}>
			{loading || !isPlayerReady ? (
				<LoadingBox />
			) : messagesToRender?.length ? (
				<Virtuoso
					ref={virtuoso}
					overscan={1024}
					increaseViewportBy={1024}
					data={messagesToRender}
					className={styledVerticalScrollbar}
					itemContent={(_index, message: ParsedMessage) => (
						<MessageRow
							key={message.id.toString()}
							message={message}
							current={message.id === currentMessage}
							setTime={(time: number) => {
								setTime(time)
								setCurrentMessage(_index)
							}}
							sessionMetadata={sessionMetadata}
						/>
					)}
				/>
			) : (
				<EmptyDevToolsCallout kind={Tab.Console} filter={filter} />
			)}
		</Box>
	)
}

const MessageRow = React.memo(function ({
	message,
	setTime,
	current,
	sessionMetadata,
}: {
	message: ParsedMessage
	setTime: (time: number) => void
	current?: boolean
	sessionMetadata: playerMetaData
}) {
	return (
		<Box
			className={clsx(
				styles.consoleRow,
				styles.messageRowVariants({
					current,
				}),
			)}
			onClick={() => {
				setTime(message.time - sessionMetadata.startTime)
			}}
		>
			<div
				className={clsx(styles.consoleBar)}
				style={{
					backgroundColor:
						COLOR_MAPPING[message.type as LogLevelGraphQL],
				}}
			>
				&nbsp;
			</div>
			<Box display="flex" alignItems="center">
				<Text
					family="monospace"
					weight="bold"
					cssClass={styles.consoleText}
				>
					{message.value}
				</Text>
			</Box>
		</Box>
	)
})
