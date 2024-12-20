'use client'

import {
   Dialog,
   DialogContent,
   DialogTitle,
   DialogTrigger
} from '@/components/ui/dialog'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormMessage
} from '@/components/ui/form'
import { Background } from '@/src/components/icons/background'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { useGoogleWeb3Auth } from '@/src/hooks/useGoogleWeb3Auth'
import { redeemUcsService } from '@/src/services/redeemUcs/redeemUcs.service'
import { DictionaryProps } from '@/src/types/dictionary'
import { handleLogout } from '@/src/utils/logout'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Info, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import i18next from '@/lib/zod-i18n-setup'
import Image from 'next/image'
import React from 'react'

export const Hero: React.FC<DictionaryProps> = ({ dictionary }: DictionaryProps) => {
   const { getGoogleWallet } = useGoogleWeb3Auth()

   const form = useForm<z.infer<typeof redeemUcsSchema>>({
      resolver: zodResolver(redeemUcsSchema),
      defaultValues: {
         name: '',
         email: '',
         code: '',
         wallet: ''
      }
   })

   const [isLoading, setIsLoading] = React.useState({
      redeem: false,
      connectWallet: false
   })

   const handleScrollTo = (scrollTo: string) => {
      const element = document.querySelector(scrollTo)
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' })
      }
   }

   async function onSubmit(data: z.infer<typeof redeemUcsSchema>) {
      setIsLoading({ ...isLoading, redeem: true })

      const response = await redeemUcsService({
         ownerEmail: data.email,
         ownerName: data.name,
         tokenCode: data.code,
         toWalletAddress: data.wallet
      })

      await new Promise((resolve) => setTimeout(resolve, 3000))

      setIsLoading({ ...isLoading, redeem: false })

      if (response.status !== 200) {
         toast.error(dictionary.messages.error.redeem)
         return
      }

      toast.success(dictionary.messages.success.redeem, { duration: 10000 })
      form.reset()
   }

   const handleConnectWallet = async () => {
      try {
         const address = await getGoogleWallet()

         if (address) {
            setIsLoading({ ...isLoading, connectWallet: true })
            await new Promise((resolve) => setTimeout(resolve, 3000))
            form.setValue('wallet', address)
         }
      } catch (error) {
         console.log(error)
         toast.error(dictionary.messages.error.wallet)
      } finally {
         setIsLoading({ ...isLoading, connectWallet: false })
      }
   }

   const [dialog, setDialog] = React.useState({
      redeem: false,
      learnMore: false
   })

   const handleCloseDialog = async () => {
      setDialog({ ...dialog, redeem: false, learnMore: false })
      form.reset()
      await handleLogout()
   }

   return (
      <React.Fragment>
         <Dialog
            open={dialog.redeem || dialog.learnMore}
            onOpenChange={() => handleCloseDialog()}
         >
            <DialogContent className="space-y-2">
               {dialog.redeem && (
                  <React.Fragment>
                     <DialogTitle>
                        <div className="space-y-2">
                           <div className="space-y-1">
                              <h1 className="text-xl font-raleway text-green-default font-semibold">
                                 {dictionary.hero.dialog.title}
                              </h1>
                              <p className="text-sm text-gray-paragraph">
                                 {dictionary.hero.dialog.description}
                              </p>
                           </div>
                        </div>
                     </DialogTitle>
                     <Form {...form}>
                        <form
                           onSubmit={form.handleSubmit(onSubmit)}
                           className="space-y-4"
                        >
                           <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormControl>
                                       <Input
                                          type="text"
                                          placeholder={
                                             dictionary.hero.dialog.form.name
                                          }
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormControl>
                                       <Input
                                          type="email"
                                          placeholder={
                                             dictionary.hero.dialog.form.email
                                          }
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="code"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormControl>
                                       <Input
                                          type="text"
                                          placeholder={
                                             dictionary.hero.dialog.form.code
                                          }
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                           <FormField
                              control={form.control}
                              name="wallet"
                              render={({ field }) => (
                                 <FormItem className="grid grid-cols-[1fr_auto_1fr] space-y-0 items-center gap-4">
                                    <div>
                                       <FormControl>
                                          <Input
                                             type="text"
                                             autoComplete="new-password"
                                             autoCorrect="off"
                                             autoSave="off"
                                             placeholder={
                                                dictionary.hero.dialog.form.wallet
                                             }
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </div>
                                    <p className="text-sm text-gray-paragraph">
                                       {dictionary.hero.dialog.form.or}
                                    </p>
                                    <div>
                                       <Button
                                          type="button"
                                          variant={'outline'}
                                          className="w-full h-10 mt-0"
                                          size={'sm'}
                                          onClick={async () =>
                                             await handleConnectWallet()
                                          }
                                          loading={isLoading.connectWallet}
                                       >
                                          <div className="flex items-center gap-2">
                                             <Wallet className="w-4 h-4" />
                                             {
                                                dictionary.hero.dialog.form
                                                   .generateWallet
                                             }
                                          </div>
                                       </Button>
                                    </div>
                                 </FormItem>
                              )}
                           />
                           <div className="grid">
                              <Button
                                 type="submit"
                                 variant={'default'}
                                 className="w-full"
                                 loading={isLoading.redeem}
                              >
                                 {dictionary.hero.dialog.form.buttons.redeem}
                              </Button>
                           </div>
                        </form>
                     </Form>
                  </React.Fragment>
               )}
               {dialog.learnMore && (
                  <React.Fragment>
                     <DialogTitle>
                        {dictionary.hero.dialog.learnMore.title}
                     </DialogTitle>
                     <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-paragraph">
                        {dictionary.hero.dialog.learnMore.description}
                     </p>
                  </React.Fragment>
               )}
            </DialogContent>
            <Background className="absolute left-1/2 -translate-x-1/2 h-[calc(100vh-82px)] opacity-80 w-screen -z-10" />
            <div
               className="min-h-[calc(100vh-82px)] flex flex-col justify-between relative"
               id="hero"
            >
               <div className="flex-1 flex items-center container px-4 md:px-0">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center w-full">
                     <div className="flex flex-col gap-6 mt-8 sm:mt-0">
                        <div className="flex flex-col gap-2">
                           <h1 className="text-3xl md:text-5xl lg:text-6xl 2xl:text-7xl font-semibold tracking-tight">
                              {dictionary.hero.title.first}
                              <br className="hidden md:block" />{' '}
                              {dictionary.hero.title.second}
                              <br className="hidden md:block" />{' '}
                              <span className="from-gradient-start to-gradient-end bg-gradient-to-tl bg-clip-text text-transparent">
                                 {dictionary.hero.title.highlight}
                              </span>
                           </h1>
                           <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-paragraph sm:max-w-[80%] lg:max-w-[70%]">
                              {dictionary.hero.description}
                           </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6">
                           <div
                              onClick={() => setDialog({ ...dialog, redeem: true })}
                           >
                              <DialogTrigger
                                 onClick={async () => {
                                    if (localStorage.getItem('openlogin_store')) {
                                       await handleLogout()
                                    }
                                 }}
                                 asChild
                              >
                                 <Button
                                    variant="default"
                                    className="w-full sm:w-auto"
                                 >
                                    {dictionary.hero.buttons.primary}
                                 </Button>
                              </DialogTrigger>
                           </div>
                           <Button
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() =>
                                 setDialog({ ...dialog, learnMore: true })
                              }
                           >
                              {dictionary.hero.buttons.secondary}
                           </Button>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-[#099817] inline-flex animate-green" />
                           <p className="text-sm font-semibold text-black-text">
                              {dictionary.hero.status.active}
                           </p>
                        </div>
                     </div>
                     <div className="w-full lg:w-[40vw] xl:w-[35vw] 2xl:w-[454px] h-[400px] md:h-[500px] 2xl:h-[600px] bg-green-default rounded-3xl relative overflow-hidden">
                        <Image
                           src="/floresta-hero.jpg"
                           alt="Floresta hero"
                           fill
                           className="object-cover object-center select-none"
                           priority
                           quality={50}
                        />
                        <div
                           className="absolute bottom-4 left-4 bg-white-default px-2 py-2 flex items-center gap-2 rounded-xl hover:bg-white-default/80 transition-colors cursor-pointer select-none"
                           onClick={() => handleScrollTo('#why-buy-ucs')}
                        >
                           <button className="bg-green-default rounded-md w-6 h-6 flex items-center justify-center p-1">
                              <Info className="text-yellow-default" />
                           </button>
                           <p className="text-sm font-semibold text-black-text">
                              {dictionary.hero.info.question}
                           </p>
                           <ArrowRight className="w-4 h-4" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </Dialog>
      </React.Fragment>
   )
}

const redeemUcsSchema = z.object({
   name: z.string().min(3, {
      message: i18next.t('validations:username')
   }),
   email: z
      .string({
         required_error: i18next.t('validations:default')
      })
      .email({
         message: i18next.t('validations:email')
      }),
   code: z.string().min(1, {
      message: i18next.t('validations:redeem')
   }),
   wallet: z.string().min(1, {
      message: i18next.t('validations:wallet')
   })
})
