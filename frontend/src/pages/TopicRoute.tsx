import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { TopicPage } from '../components/TopicPage'
import { TOPICS } from '../data/topics'

export function TopicRoute() {
  const { topicId } = useParams<{ topicId: string }>()
  const navigate = useNavigate()
  const topic = TOPICS.find((t) => t.id === topicId)

  if (!topic) {
    return <Navigate to="/learn" replace />
  }

  return (
    <TopicPage
      topic={topic}
      allTopics={TOPICS}
      onBack={() => navigate('/learn')}
      onAskAbout={(question) => {
        navigate('/ask', { state: { prefillQuestion: question } })
      }}
    />
  )
}
