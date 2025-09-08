import React from 'react'
import { PricingTable } from '@clerk/nextjs'
function Billing() {
  return (
    <div>
      <h2 className='font-bold text-3xl text-center'>Choose Your Plan</h2>
      <p className='text-lg text-center'>Your complete AI toolkit is waiting. Subscribe now to gain unlimited access.</p>
      <div className='mt-6'>
        <PricingTable /> 
      </div>
      
    </div>
  )
}

export default Billing