import { useState, useEffect, useCallback } from 'react';
import { useReddit } from '@devvit/web/client';

// ========== COMMON COMPONENTS ==========

function Badge({ children, variant = 'default' }) {
  const colors = {
    default: { bg: '#e0e0e0', color: '#333' },
    success: { bg: '#d4edda', color: '#155724' },
    warning: { bg: '#fff3cd', color: '#856404' },
    danger: { bg: '#f8d7da', color: '#721c24' },
    info: { bg: '#d1ecf1', color: '#0c5460' },
  };
  const style = colors[variant] || colors.default;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: style.bg,
      color: style.color,
    }}>
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = 'primary', disabled = false }) {
  const colors = {
    primary: { bg: '#0079d3', color: '#fff' },
    secondary: { bg: '#e0e0e0', color: '#333' },
    danger: { bg: '#dc3545', color: '#fff' },
    success: { bg: '#28a745', color: '#fff' },
  };
  const style = colors[variant] || colors.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        backgroundColor: disabled ? '#ccc' : style.bg,
        color: disabled ? '#666' : style.color,
        fontSize: '14px',
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, title, actions }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '16px',
      overflow: 'hidden',
    }}>
      {title && (
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{title}</span>
          {actions}
        </div>
      )}
      <div style={{ padding: '16px' }}>
        {children}
      </div>
    </div>
  );
}

function ListItem({ children, onClick, active = false }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        cursor: pointer,
        backgroundColor: active ? '#e3f2fd' : 'transparent',
        transition: 'background-color 0.2s',
      }}
    >
      {children}
    </div>
  );
}

function Avatar({ name, size = 32 }) {
  const colors = ['#0079d3', '#ff4500', '#00d4aa', '#9b59b6', '#e74c3c'];
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: colors[colorIndex],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: `${size * 0.4}px`,
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0' }}>{title}</h3>
      <p style={{ margin: 0 }}>{description}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #0079d3',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ========== MAIN APP ==========

export function App() {
  const reddit = useReddit();
  const [activeTab, setActiveTab] = useState('queue');
  const [isLoading, setIsLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [mail, setMail] = useState([]);
  const [flairs, setFlairs] = useState([]);
  const [users, setUsers] = useState([]);
  const [team, setTeam] = useState([]);
  const [stats, setStats] = useState({
    queueCount: 0,
    todayActions: 0,
    teamMembers: 0,
    spamBlocked: 0,
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setQueue([
        { id: '1', type: 'post', title: 'Spam post about crypto', author: 'spammer1', reports: 3, time: '2m ago' },
        { id: '2', type: 'comment', author: 'troll_user', body: 'Offensive comment...', reports: 5, time: '5m ago' },
        { id: '3', type: 'post', title: 'Self-promotion without flair', author: 'new_user', reports: 1, time: '12m ago' },
      ]);
      setLogs([
        { id: '1', action: 'remove', mod: 'AutoModerator', target: 'spammer1', time: '1m ago' },
        { id: '2', action: 'approve', mod: 'Brett', target: 'good_user', time: '5m ago' },
        { id: '3', action: 'ban', mod: 'SeniorMod', target: 'troll_user', time: '10m ago' },
      ]);
      setMail([
        { id: '1', from: 'concerned_user', subject: 'Why was my post removed?', time: '3m ago' },
        { id: '2', from: 'new_mod_applicant', subject: 'Can I join the mod team?', time: '1h ago' },
      ]);
      setFlairs([
        { id: '1', text: 'Discussion', cssClass: 'discussion', count: 1234 },
        { id: '2', text: 'Question', cssClass: 'question', count: 567 },
        { id: '3', text: 'Meme', cssClass: 'meme', count: 890 },
      ]);
      setUsers([
        { name: 'spammer1', actions: { remove: 5, ban: 1 }, lastSeen: '2m ago' },
        { name: 'troll_user', actions: { remove: 12, mute: 2 }, lastSeen: '5m ago' },
        { name: 'good_user', actions: { approve: 45 }, lastSeen: '1h ago' },
      ]);
      setTeam([
        { name: 'Brett', role: 'Head Mod', status: 'online', actions: 156 },
        { name: 'SeniorMod', role: 'Moderator', status: 'online', actions: 89 },
        { name: 'JuniorMod', role: 'Moderator', status: 'offline', actions: 23 },
      ]);
      setStats({
        queueCount: 3,
        todayActions: 42,
        teamMembers: 3,
        spamBlocked: 17,
      });
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleApprove = useCallback((item) => {
    console.log('Approved:', item);
    setQueue(prev => prev.filter(q => q.id !== item.id));
  }, []);

  const handleRemove = useCallback((item) => {
    console.log('Removed:', item);
    setQueue(prev => prev.filter(q => q.id !== item.id));
  }, []);

  const handleBan = useCallback((user) => {
    console.log('Banned:', user);
    setUsers(prev => prev.filter(u => u.name !== user.name));
  }, []);

  const tabs = [
    { id: 'queue', label: 'Queue', icon: '📋', count: queue.length },
    { id: 'log', label: 'Log', icon: '📜', count: logs.length },
    { id: 'mail', label: 'Mail', icon: '✉️', count: mail.length },
    { id: 'flair', label: 'Flair', icon: '🏷️', count: flairs.length },
    { id: 'users', label: 'Users', icon: '👥', count: users.length },
    { id: 'team', label: 'Team', icon: '🛡️', count: team.length },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', color: '#0079d3' }}>Brett's Mod Hub</h1>
        <p style={{ margin: 0, color: '#666' }}>All-in-one moderation dashboard</p>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard label="Queue" value={stats.queueCount} color="#ff4500" />
        <StatCard label="Today" value={stats.todayActions} color="#0079d3" />
        <StatCard label="Team" value={stats.teamMembers} color="#00d4aa" />
        <StatCard label="Spam" value={stats.spamBlocked} color="#9b59b6" />
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '4px',
        marginBottom: '16px',
        padding: '4px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1',
              minWidth: '80px',
              padding: '10px 12px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              backgroundColor: activeTab === tab.id ? '#0079d3' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#333',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon} {tab.label}
            {tab.count > 0 && (
              <span style={{
                marginLeft: '4px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#e0e0e0',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'queue' && <QueueTab queue={queue} onApprove={handleApprove} onRemove={handleRemove} />}
      {activeTab === 'log' && <LogTab logs={logs} />}
      {activeTab === 'mail' && <MailTab mail={mail} />}
      {activeTab === 'flair' && <FlairTab flairs={flairs} />}
      {activeTab === 'users' && <UsersTab users={users} onBan={handleBan} />}
      {activeTab === 'team' && <TeamTab team={team} />}
    </div>
  );
}

// ========== STAT CARD ==========

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: '12px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#666' }}>{label}</div>
    </div>
  );
}

// ========== QUEUE TAB ==========

function QueueTab({ queue, onApprove, onRemove }) {
  if (queue.length === 0) {
    return <EmptyState icon="✅" title="Queue is clear!" description="No items to review right now." />;
  }

  return (
    <div>
      <Card title="Moderation Queue" actions={<span style={{ fontSize: '14px', color: '#666' }}>{queue.length} items</span>}>
        {queue.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {item.type === 'post' ? '📝 Post' : '💬 Comment'} by u/{item.author}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                {item.title || item.body}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {item.reports} reports · {item.time}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="success" onClick={() => onApprove(item)}>✓</Button>
              <Button variant="danger" onClick={() => onRemove(item)}>✗</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ========== LOG TAB ==========

function LogTab({ logs }) {
  if (logs.length === 0) {
    return <EmptyState icon="📜" title="No logs yet" description="Moderation actions will appear here." />;
  }

  return (
    <div>
      <Card title="Moderation Log">
        {logs.map(log => (
          <div key={log.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div>
              <Badge variant={log.action === 'approve' ? 'success' : log.action === 'ban' ? 'danger' : 'warning'}>
                {log.action}
              </Badge>
              <span style={{ marginLeft: '8px' }}>
                u/{log.target} by u/{log.mod}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#999' }}>{log.time}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ========== MAIL TAB ==========

function MailTab({ mail }) {
  if (mail.length === 0) {
    return <EmptyState icon="✉️" title="No new mail" description="Mod mail messages will appear here." />;
  }

  return (
    <div>
      <Card title="Mod Mail">
        {mail.map(msg => (
          <ListItem key={msg.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{msg.subject}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>From u/{msg.author}</div>
              </div>
              <span style={{ fontSize: '12px', color: '#999' }}>{msg.time}</span>
            </div>
          </ListItem>
        ))}
      </Card>
    </div>
  );
}

// ========== FLAIR TAB ==========

function FlairTab({ flairs }) {
  return (
    <div>
      <Card title="Flair Management" actions={<Button>Add Flair</Button>}>
        {flairs.map(flair => (
          <div key={flair.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: '#e3f2fd',
                color: '#0079d3',
                fontWeight: 'bold',
                fontSize: '14px',
              }}>
                {flair.text}
              </span>
            </div>
            <span style={{ fontSize: '14px', color: '#666' }}>{flair.count} users</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ========== USERS TAB ==========

function UsersTab({ users, onBan }) {
  if (users.length === 0) {
    return <EmptyState icon="👥" title="No flagged users" description="Users with moderation history will appear here." />;
  }

  return (
    <div>
      <Card title="User History">
        {users.map(user => (
          <div key={user.name} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar name={user.name} />
              <div>
                <div style={{ fontWeight: 'bold' }}>u/{user.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {Object.entries(user.actions).map(([action, count]) => (
                    <span key={action} style={{ marginRight: '8px' }}>
                      {action}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#999' }}>{user.lastSeen}</span>
              <Button variant="danger" onClick={() => onBan(user)}>Ban</Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ========== TEAM TAB ==========

function TeamTab({ team }) {
  return (
    <div>
      <Card title="Mod Team">
        {team.map(member => (
          <div key={member.name} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={member.name} />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: member.status === 'online' ? '#00d4aa' : '#ccc',
                  border: '2px solid #fff',
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>u/{member.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{member.role}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold' }}>{member.actions}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>actions today</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default App;
