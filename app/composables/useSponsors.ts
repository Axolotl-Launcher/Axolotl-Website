import sponsorsData from '~/data/sponsors.json'
import type { Sponsor } from '~/types/sponsors'

interface SponsorRecord extends Omit<Sponsor, 'description'> {
  description: Record<string, string>
}

export function useSponsors() {
  const { locale } = useI18n()

  const sponsors = computed<Sponsor[]>(() =>
    (sponsorsData as SponsorRecord[]).map((sponsor) => ({
      ...sponsor,
      description:
        sponsor.description[locale.value] ?? sponsor.description['en-US'] ?? sponsor.description['zh-CN'] ?? '',
    })),
  )

  return { sponsors }
}
