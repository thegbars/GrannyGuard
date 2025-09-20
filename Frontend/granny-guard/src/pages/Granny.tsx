import Greeter from '../components/Greeter.tsx';

function Granny() {
    return (
        <div className="grid grid-cols-2 grid-rows-2 h-screen w-screen">
            <div className="flex bg-red-100">
                <div className="my-2 ms-2">
                    <Greeter />
                </div>

            </div>
            <div className="flex items-center justify-center bg-green-100">
                Top Right
            </div>
            <div className="flex items-center justify-center bg-blue-100">
                Bottom Left
            </div>
            <div className="flex items-center justify-center bg-yellow-100">
                Bottom Right
            </div>
        </div>
    )
}

export default Granny
