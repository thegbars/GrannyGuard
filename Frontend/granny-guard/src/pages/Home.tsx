import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';


function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <p className="text-2xl font-bold">GRANNY GUARD</p>
            <div className="flex gap-4">
                <Link to="/granny"><Button>Granny View</Button></Link>
                <Link to="/caretaker"><Button>Caretaker View</Button></Link>
            </div>

            <p className="text-xs text-muted-foreground">
                Grandma icon by Freepik – <a href="https://www.flaticon.com/free-icons/grandma" target="_blank" rel="noopener noreferrer">Flaticon</a>
            </p>

        </div>
    )
}

export default Home
