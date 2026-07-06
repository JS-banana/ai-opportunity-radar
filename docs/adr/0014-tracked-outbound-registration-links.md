# Tracked outbound registration links

Registration buttons will use a thin outbound route that accepts an activity opportunity `record_id`, records a click event, resolves the official entry URL from the current snapshot, and redirects. Activity details are viewed on this website; registration and form submission happen on the official activity page. The route must not accept arbitrary destination URLs, avoiding open redirect behavior while preserving simple click analytics.
