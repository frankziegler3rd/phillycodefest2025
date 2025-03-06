import { useState } from 'react';

const API = 'http://127.0.0.1:8000'

function Chat({bookId, charName, library}) {
    const [query, setQuery] = useState('');
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendQuery = async (query) => {
        setLoading(true);
        setQuery('');

        setChat(prevChat => [...prevChat, { role: 'user', content: query }]);
        
        console.log(chat);
        try {
            const response = await fetch(`${API}/chat`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    book_id: bookId,
                    char_name: charName,
                    query: query,
                    conv_hist: chat,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(result);

            setChat(prevChat => [...prevChat, { role: 'assistant', content: result }]);
        } catch (error) {
            console.error('Error fetching chat data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendQuery(query);
        console.log(chat);
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-base">
            <div className="w-full max-w-2xl flex-1 overflow-y-auto p-4 bg-white shadow-lg rounded-2xl">
                <ul className="space-y-2">
                    {chat.map((item, index) => (
                        <li
                            key={index}
                            className={`p-2 rounded-lg max-w-[75%] ${item.role === "user" ? "bg-blue-100 text-blue-800 self-end ml-auto text-right" : "bg-gray-100 text-gray-800 self-start mr-auto text-left"
                                }`}
                        >
                            <strong>{item.role}:</strong> {item.content}
                        </li>
                    ))}
                    {loading && (
                        <li className="p-2 rounded-lg max-w-[75%] bg-gray-100 text-gray-800 self-start mr-auto text-left">
                            <strong>assistant:</strong> Loading...
                        </li>
                    )}
                </ul>
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-2xl flex space-x-2 p-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="text-black flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-base"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;