import contextlib
import logging
import typing

from opentelemetry import trace, _logs
from opentelemetry._logs.severity import std_to_otel
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.sdk._logs import LoggerProvider, LogRecord
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider, _Span
from opentelemetry.sdk.trace.export import BatchSpanProcessor

HIGHLIGHT_REQUEST_HEADER = 'X-Highlight-Request'
HIGHLIGHT_OTLP_HTTP = 'https://otel.highlight.io:4318'

provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(f'{HIGHLIGHT_OTLP_HTTP}/v1/traces')))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

log_provider = LoggerProvider()
log_provider.add_log_record_processor(BatchLogRecordProcessor(OTLPLogExporter(f'{HIGHLIGHT_OTLP_HTTP}/v1/logs')))
_logs.set_logger_provider(log_provider)
log = log_provider.get_logger(__name__)


@contextlib.contextmanager
def highlight_error_handler(headers: typing.Dict[str, str]):
    session_id, request_id = '', ''
    try:
        session_id, request_id = headers[HIGHLIGHT_REQUEST_HEADER].split('/')
        logging.info(f'got highlight context {session_id} {request_id}')
    except KeyError:
        pass

    with tracer.start_as_current_span("highlight-ctx") as span:
        span.set_attributes({'highlight_session_id': session_id})
        span.set_attributes({'highlight_request_id': request_id})
        try:
            yield
        except Exception as e:
            span.record_exception(e)
            logging.exception("Highlight caught an error", exc_info=e)


def log_hook(span: _Span, record: logging.LogRecord):
    if span and span.is_recording():
        ctx = span.get_span_context()
        r = LogRecord(
            timestamp=int(record.created),
            trace_id=ctx.trace_id,
            span_id=ctx.span_id,
            trace_flags=ctx.trace_flags,
            severity_text=record.levelname,
            severity_number=std_to_otel(record.levelno),
            body=record.getMessage(),
            resource=Resource({}),
        )
        log.emit(r)


def instrument_logs():
    LoggingInstrumentor().instrument(set_logging_format=True, log_hook=log_hook)
