import PollList from '../components/PollList'
import CreatePollForm from '../components/CreatePollForm'
import AuthWrapper from '../components/AuthWrapper'

export default function PollsPage() {
  return (
    <AuthWrapper>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Polls</h1>
        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Create a New Poll</h2>
          <CreatePollForm />
        </div> */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Current Polls</h2>
          <PollList />
        </div>
      </div>
    </AuthWrapper>
  )
}

