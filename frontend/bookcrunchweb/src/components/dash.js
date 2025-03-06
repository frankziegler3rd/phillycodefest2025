import { useState, useEffect } from "react";

function Dash() {
    const [library, setLibrary] = useState([]);   
    
    useEffect(() => {
        const getLibrary = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/', {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setLibrary(data);
            } catch (error) {
                console.error(error);
            }
        };

        getLibrary();
    }, []);

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Library Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {library.map((book) => (
                    <div key={book.uid} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="mb-3">
                            <h2 className="text-xl font-semibold text-gray-900">{book.title}</h2>
                            <p className="text-gray-600 text-sm mt-1">{book.summary}</p>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Characters</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {book.character_list.map((char, i) => (
                                    <div key={i} className="bg-blue-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                        <h4 className="text-lg font-semibold text-blue-500">{char.name}</h4>
                                        <p className="text-gray-700 text-sm">{char.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dash;