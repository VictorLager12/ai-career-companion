import React from 'react'
import WelcomeBanner from './_components/WelcomeBanner'
import Aitools from './_components/Aitools'
import History from './_components/History'



function Dashboard() {
    return (
        <div>
            <WelcomeBanner />
            <Aitools />
            <History />
            
        </div>
    )
}

export default Dashboard