"""In-process TTL cache for immutable COMPLETED job reads."""

from __future__ import annotations

from cachetools import TTLCache

_CACHE: TTLCache = TTLCache(maxsize=512, ttl=86400)


def get_cached(key: str):
	"""Return a cached payload or None."""
	return _CACHE.get(key)


def set_cached(key: str, payload) -> None:
	"""Store one cached payload."""
	_CACHE[key] = payload


def invalidate(job_uuid: str) -> None:
	"""Drop cached entries for one job UUID."""
	prefix = f"{job_uuid}:"
	keys_to_drop = [key for key in list(_CACHE.keys()) if key == job_uuid or key.startswith(prefix)]
	for key in keys_to_drop:
		_CACHE.pop(key, None)


def clear_cache() -> None:
	"""Clear all cached entries (test helper)."""
	_CACHE.clear()
