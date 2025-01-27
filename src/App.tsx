/**
 * @description: npm package of helport-assistant is not supported yet
 */

import { useEffect, useRef, useState } from 'react'
import Assistant from 'helport-assistant'
import { AssistantService } from 'helport-assistant'
import './App.css'
import { AIGateMessageUnion } from 'helport-assistant'

const ORIGIN = 'https://pstnj.ucall.tech'

function App() {
  const assistant = useRef(new Assistant({ origin: ORIGIN }))
  const url = new URLSearchParams(window.location.search)
  // --- login ---
  const [token, setToken] = useState<string>(url.get('token') || '')
  const [bizID, setBizID] = useState<string>(url.get('business_type_id') || '')
  const [isLogin, setIsLogin] = useState(false)
  const [userInfo, setUserInfo] = useState<AssistantService.UserInfo>()
  // --- start
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState<AIGateMessageUnion[]>([])

  useEffect(() => {
    const handleMessage = (message: AIGateMessageUnion) => {
      console.log('[aiMessage]:', message)
      setMessages(prev => [message, ...prev])
    }
    assistant.current.on('aiMessage', handleMessage)
    return () => {
      assistant.current.off('aiMessage', handleMessage)
    }
  }, [])
  return (
    <div>
      {!isLogin && (
        <div className="card">
          <button
            onClick={() => {
              window.location.href = `${ORIGIN}/oauth/login?app=dolphin&redirect_uri=${window.location.origin}`
            }}
          >
            Redirect to get token and bizID
          </button>
          <div>or</div>
          <input
            value={token}
            name="token"
            placeholder="token"
            onChange={e => {
              setToken(e.target.value)
            }}
          />
          <input
            value={bizID}
            name="bizID"
            placeholder="bizID"
            onChange={e => {
              setBizID(e.target.value)
            }}
          />
          <button
            className="api"
            onClick={async () => {
              try {
                const info = await assistant.current.login({ token, bizID })
                console.log('[login-return]:', info)
                setIsLogin(true)
                setUserInfo(info)
              } catch (e) {
                console.error(e)
                alert((e as Error).message)
              }
            }}
          >
            login
          </button>
        </div>
      )}
      {isLogin && userInfo && (
        <div className="card">
          <div>user: {`${userInfo.username}(${userInfo.userId})`}</div>
          <div className="actions">
            <button
              className="api"
              disabled={started}
              onClick={async () => {
                try {
                  await assistant.current.start()
                  assistant.current.setProductID(19)
                  setStarted(true)
                } catch (e) {
                  console.error(e)
                  alert((e as Error).message)
                }
              }}
            >
              start {started && '✅'}
            </button>
            {started && (
              <button
                className="api"
                onClick={async () => {
                  try {
                    await assistant.current.stop()
                    setStarted(false)
                  } catch (e) {
                    console.error(e)
                    alert((e as Error).message)
                  }
                }}
              >
                stop
              </button>
            )}
            {isLogin && (
              <button
                className="api"
                onClick={async () => {
                  try {
                    await assistant.current.logout()
                    setIsLogin(false)
                    setStarted(false)
                  } catch (e) {
                    console.error(e)
                    alert((e as Error).message)
                  }
                }}
              >
                logout
              </button>
            )}
          </div>
          {started && (
            <>
              <div className="actions">
                <button
                  className="api"
                  onClick={() => {
                    assistant.current.send({
                      type: 'onCall',
                      customerInfo: { userID: 'xxx1', userName: 'fff' }
                    })
                  }}
                >
                  onCall
                </button>
                <button
                  className="api"
                  onClick={() => {
                    assistant.current.send({
                      type: 'onTalkBegin'
                    })
                  }}
                >
                  onTalkBegin
                </button>
                <button
                  className="api"
                  onClick={() => {
                    assistant.current.send({
                      type: 'onClosed'
                    })
                  }}
                >
                  onClosed
                </button>
              </div>
            </>
          )}
          <div className="messages">
            <div className="title">
              <div>Messages</div>
              <div className="actions">
                <button
                  onClick={() => {
                    setMessages([])
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {messages.map(msg => {
              return (
                <div key={msg.header.messageID}>
                  <pre>{JSON.stringify(msg, null, 2)}</pre>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
