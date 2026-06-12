/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isTimeUp, setIsTimeUp] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const difference = target - now;

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds };
        };

        const countdownInterval = setInterval(() => {
            const timeLeft = calculateTimeLeft();
            setTimeLeft(timeLeft);

            if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
                clearInterval(countdownInterval);
                setIsTimeUp(true);
            }
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [targetDate]);

    // Notify parent once when countdown hits zero
    useEffect(() => {
        if (isTimeUp) {
            onExpire?.();
        }
    }, [isTimeUp]);

    return (
        <div>
            <div className={`font-bold m-2 text-lg ${isTimeUp ? 'text-red-600' : ''}`}>
                {isTimeUp ? 'Time is up!' : 'Time remaining:'}
            </div>
            <div className='flex flex-row items-center justify-center'>
                <div className="grid grid-flow-col lg:gap-5 text-center auto-cols-max mb-5">
                    <div className={`flex flex-col p-2 rounded-sm bordered ${isTimeUp ? 'bg-red-100 text-red-700' : 'bg-white text-black'}`}>
                        <span className="countdown font-mono text-5xl">
                            <span style={{ "--value": timeLeft.days }}></span>
                        </span>
                        days
                    </div>
                    <div className={`flex flex-col p-2 rounded-sm bordered ${isTimeUp ? 'bg-red-100 text-red-700' : 'bg-white text-black'}`}>
                        <span className="countdown font-mono text-5xl">
                            <span style={{ "--value": timeLeft.hours }}></span>
                        </span>
                        hours
                    </div>
                    <div className={`flex flex-col p-2 rounded-sm bordered ${isTimeUp ? 'bg-red-100 text-red-700' : 'bg-white text-black'}`}>
                        <span className="countdown font-mono text-5xl">
                            <span style={{ "--value": timeLeft.minutes }}></span>
                        </span>
                        min
                    </div>
                    <div className={`flex flex-col p-2 rounded-sm bordered ${isTimeUp ? 'bg-red-100 text-red-700' : 'bg-white text-black'}`}>
                        <span className="countdown font-mono text-5xl">
                            <span style={{ "--value": timeLeft.seconds }}></span>
                        </span>
                        sec
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;