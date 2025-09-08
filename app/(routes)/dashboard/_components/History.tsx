"use client"

import { Button } from '@/components/ui/button'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { aiToolsList } from './Aitools'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2 } from 'lucide-react' // Import Trash icon
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // Import Alert Dialog

function History() {
  const [userHistory, setUserHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State to manage which item is being considered for deletion
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    GetHistory();
  }, [])

  const GetHistory = async () => {
    setLoading(true);
    const result = await axios.get('/api/history');
    setUserHistory(result.data);
    setLoading(false);
  }

  const GetAgentName = (path: string) => {
    const agent = aiToolsList.find(item => item.path == path);
    return agent;
  }

  // Function to handle the confirmed deletion
  const onHistoryDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await axios.delete('/api/history?recordId=' + itemToDelete.recordId);
      // Update UI state to reflect deletion
      setUserHistory(prevHistory => prevHistory.filter((h: any) => h.recordId !== itemToDelete.recordId));
    } catch (error) {
      console.error("Failed to delete history item:", error);
      // Optionally, show an error toast to the user
    } finally {
      setItemToDelete(null); // Reset the item to delete
    }
  }

  return (
    <div className='mt-5 p-5 border rounded-xl'>
      <h2 className='font-bold text-lg'>Previous History</h2>
      <p>Here’s what you’ve worked on before.</p>

      {loading && (
        <div>
          {[1, 2, 3, 4, 5].map((item, index) => (
            <div key={index}>
              <Skeleton className="h-[50px] mt-4 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {userHistory?.length == 0 && !loading ? (
        <div className='flex items-center justify-center flex-col mt-6'>
          <Image src={'/bulb.png'} alt='bulb' width={50} height={50} />
          <h2>You don't have any history</h2>
          <Button className='mt-5'>Explore AI Tools</Button>
        </div>
      ) : (
        <div>
          {userHistory?.map((history: any, index: number) => (
            <div key={index} className='flex justify-between items-center my-3 border p-3 rounded-lg group hover:bg-gray-50 dark:hover:bg-neutral-800'>
              <Link href={history?.aiAgentType + "/" + history?.recordId} className='flex-grow flex items-center gap-5'>
                <Image src={GetAgentName(history?.aiAgentType)?.icon} alt={'image'} width={20} height={20} />
                <h2>{GetAgentName(history?.aiAgentType)?.name}</h2>
              </Link>
              <div className='flex items-center gap-4'>
                <h2 className='text-sm text-gray-500'>{new Date(history.createdAt).toLocaleString()}</h2>
                
                {/* Delete Button and Confirmation Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Trash2 
                      onClick={() => setItemToDelete(history)}
                      className='h-5 w-5 text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity' 
                    />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        chat history and remove the data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onHistoryDelete}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History;