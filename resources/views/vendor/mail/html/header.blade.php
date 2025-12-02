@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
    <svg width="40" height="40" viewBox="0 0 100 100" style="vertical-align: middle;">
        <circle cx="50" cy="50" r="45" fill="#2d3748"/>
        <text x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-weight="bold">{{ substr(config('app.name', 'F'), 0, 1) }}</text>
    </svg>
    <span style="font-size: 22px; font-weight: bold; color: #2d3748;">{{ config('app.name') }}</span>
</div>
</a>
</td>
</tr>
