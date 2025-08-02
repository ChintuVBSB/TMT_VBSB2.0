export default function UserList({ users = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map(user => (
        <div key={user._id} className="border p-4 shadow rounded">
          <h2 className="font-bold">{user.name}</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.status}</p>
        </div>
      ))}
    </div>
  );
}