export interface ChangelogChannel {
  value: string
  labelKey: string
  matches: (entry: { version: string }) => boolean
}

export function isPrerelease(version: string): boolean {
  return version.includes('-')
}

// The changelog derives both its tabs and its filtering from this list.
// Adding a future channel (for example an alpha ring) means appending one
// definition plus its label in the locale files — no page logic changes.
export const changelogChannels: [ChangelogChannel, ...ChangelogChannel[]] = [
  {
    value: 'all',
    labelKey: 'changelog.tabAll',
    matches: () => true,
  },
  {
    value: 'release',
    labelKey: 'changelog.tabRelease',
    matches: (entry) => !isPrerelease(entry.version),
  },
  {
    value: 'beta',
    labelKey: 'changelog.tabBeta',
    matches: (entry) => entry.version.includes('-beta'),
  },
]
