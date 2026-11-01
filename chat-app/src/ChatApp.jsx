import { useMemo, useRef, useState } from 'react';
import { Send, Heart, Smile, MessageCircle, AtSign } from 'lucide-react';

const USERS = ['Alan', 'Bob', 'Carol', 'Dean', 'Elin'];
const EMOJIS = ['😀', '😂', '❤️', '👍', '🎉', '🔥'];

export default function ChatApp() {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const inputRef = useRef(null);
  const suggestions = useMemo(() => USERS.filter(user => user.toLowerCase().includes(mentionFilter.toLowerCase())), [mentionFilter]);

  function updateDraft(value) {
    setDraft(value);
    const at = value.lastIndexOf('@');
    if (at >= 0 && (at === 0 || /\s/.test(value[at - 1]))) {
      const query = value.slice(at + 1).split(/\s/)[0];
      setMentionFilter(query);
      setShowMentions(!query.includes(' '));
    } else setShowMentions(false);
  }

  function insertMention(user) {
    const at = draft.lastIndexOf('@');
    setDraft(`${draft.slice(0, at)}@${user} `);
    setShowMentions(false);
    inputRef.current?.focus();
  }

  function sendMessage(event) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content) return;
    const username = USERS[Math.floor(Math.random() * USERS.length)];
    setMessages(current => [...current, { id: `${Date.now()}-${Math.random()}`, username, content, likes: 0, time: new Date() }]);
    setDraft('');
    setShowMentions(false);
    setShowEmoji(false);
  }

  function likeMessage(id) {
    setMessages(current => current.map(message => message.id === id ? { ...message, likes: message.likes + 1 } : message));
  }

  return (
    <main className="chat-page">
      <header className="chat-header">
        <div className="chat-logo"><MessageCircle size={22}/></div>
        <div><p className="kicker">TEAM SPACE</p><h1>Team Chat</h1></div>
        <span className="online-pill"><i/> Live conversation</span>
      </header>
      <section className="conversation">
        <div className="conversation-heading"><div><h2>General</h2><p>Share updates and ideas with your team.</p></div><span>{messages.length} messages</span></div>
        {messages.length === 0 ? <div className="empty-state"><div className="empty-icon"><MessageCircle size={28}/></div><h3>Start the conversation</h3><p>Your messages will appear here. Say hello to the team!</p></div> :
          <div className="message-list" aria-live="polite">
            {messages.map(message => <article className="message" key={message.id}>
              <div className="avatar">{message.username[0]}</div>
              <div className="message-body"><div className="message-top"><strong>{message.username}</strong><time>{message.time.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time></div>
                <p>{message.content.split(/(@[A-Za-z]+)/g).map((part, index) => part.startsWith('@') ? <span className="mention" key={index}>{part}</span> : part)}</p>
              </div>
              <button className="message-like" onClick={() => likeMessage(message.id)} aria-label={`Like message, ${message.likes} likes`}><Heart size={17}/><span>{message.likes}</span></button>
            </article>)}
          </div>}
      </section>
      <form className="composer" onSubmit={sendMessage}>
        {showEmoji && <div className="emoji-popover">{EMOJIS.map(emoji => <button type="button" key={emoji} onClick={() => updateDraft(draft + emoji)}>{emoji}</button>)}</div>}
        {showMentions && <div className="mention-popover"><span>MENTION A TEAMMATE</span>{suggestions.length ? suggestions.map(user => <button type="button" key={user} onClick={() => insertMention(user)}><span className="mini-avatar">{user[0]}</span>{user}</button>) : <p>No matching users</p>}</div>}
        <div className="input-row">
          <button type="button" className={`tool-button ${showEmoji ? 'active' : ''}`} title="Add emoji" onClick={() => {setShowEmoji(v => !v);setShowMentions(false)}}><Smile size={20}/></button>
          <button type="button" className="tool-button mention-tool" title="Mention a user" onClick={() => {updateDraft(draft + (draft.endsWith(' ') || !draft ? '' : ' ') + '@');setShowEmoji(false)}}><AtSign size={19}/></button>
          <input ref={inputRef} value={draft} onChange={e => updateDraft(e.target.value)} placeholder="Write a message… (use @ to mention someone)" aria-label="Message" />
          <button type="submit" className="send-button" disabled={!draft.trim()}><Send size={17}/><span>Send</span></button>
        </div>
        <div className="composer-hint">Press <kbd>Enter</kbd> to send · Use <kbd>@</kbd> to mention a teammate</div>
      </form>
      <footer className="chat-footer">A simple space for good conversations.</footer>
    </main>
  );
}
