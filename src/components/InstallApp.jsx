import { useEffect, useState } from "react";

export default function InstallApp() {
    const [prompt, setPrompt] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    function install() {
        if (prompt) {
            prompt.prompt();
            prompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    setPrompt(null);
                }
            });
        }
    }

    if (!prompt) return null;

    return (
        <button 
            onClick={install}
            className="fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50 animate-bounce"
        >
            Instalar App
        </button>
    );
}
