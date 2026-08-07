import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([]) // { role: 'user' | 'ai', text: string }
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!message.trim() || loading) return

    const userMessage = message
    setChat((prev) => [...prev, { role: 'user', text: userMessage }])
    setMessage('')
    setLoading(true)

    try {
      const aiReply = await getAIResponse(userMessage)
      setChat((prev) => [...prev, { role: 'ai', text: aiReply }])
    } catch (err) {
      console.error(err)
      setChat((prev) => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAsk()
  }

  return (
    <div className='grid grid-cols-5 h-screen text-center bg-zinc-900 text-white'>

      {/* Sidebar */}
      <div className='col-span-1 bg-zinc-800 flex flex-col p-4'>
        <h2 className='text-lg font-semibold mb-4'>Chat History</h2>
      </div>

      {/* Main content */}
      <div className='col-span-4 flex flex-col justify-between h-screen'>

        {/* Chat / greeting area */}
        <div className='container h-110 flex-1 overflow-y-auto px-4 py-6'>
          {chat.length === 0 ? (
            <div className='h-full flex items-center justify-center'>
              <h1 className='text-3xl font-bold linear-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent'>
                Hello User, Ask me Anything
              </h1>
            </div>
          ) : (
            <div className='flex flex-col gap-3 max-w-2xl mx-auto text-left'>
              {chat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-purple-600 self-end ml-auto'
                      : 'bg-zinc-700 self-start'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <div className='bg-zinc-700 px-4 py-2 rounded-2xl max-w-[80%] self-start animate-pulse'>
                  Thinking...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className='w-1/2 mx-auto mb-8 flex items-center bg-zinc-800 rounded-full px-4 py-2 shadow-lg'>
          <input
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Ask me anything'
            disabled={loading}
            className='flex-1 bg-transparent outline-none text-white placeholder-zinc-400 px-2'
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className='bg-purple-600 hover:bg-purple-700 transition-colors text-white px-4 py-1.5 rounded-full text-sm font-medium disabled:opacity-50'
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>

      </div>
    </div>
  )
}

// --- API call goes here ---
async function getAIResponse(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY // put your key in a .env file

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.'
}

export default App