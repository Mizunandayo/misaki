import { ModelRouterPanel } from '@/components/intelligence/ModelRouterPanel'

export const dynamic = 'force-dynamic'

export default function ModelRouterPage() {
  return (
    <div className="px-6 py-8 overflow-y-auto">
      <ModelRouterPanel />
    </div>
  )
}
