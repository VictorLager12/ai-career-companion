"use client";

import Image from "next/image";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import React from "react";

export default function Home() {
  const { user } = useUser();

  return (
    <div>
      {/* Header */}
      <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white border-b border-gray-200 text-sm py-3 sm:py-0 dark:bg-neutral-800 dark:border-neutral-700 shadow-sm">
        <nav
          className="relative p-4 max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex items-center justify-between">
            <Image
              src={"/logo.png"}
              alt="AI Career Companion Logo"
              width={100}
              height={100}
              className="w-full"
            />
          </div>

          <div
            id="navbar-collapse-with-animation"
            className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end sm:ps-7 cursor-pointer">
              {/* Clerk Authentication */}
              {!user ? (
                <SignInButton mode="modal" signUpForceRedirectUrl={"/dashboard"}>
                  <div className="flex items-center gap-x-2 font-medium text-gray-500 hover:text-emerald-600 sm:border-s sm:border-gray-300 py-2 sm:py-0 sm:ms-4 sm:my-6 sm:ps-6 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-emerald-500">
                    <svg
                      className="flex-shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                    </svg>
                    Get Started
                  </div>
                </SignInButton>
              ) : (
                <UserButton />
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] dark:before:bg-[url('https://preline.co/assets/svg/examples-dark/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="mt-5 max-w-2xl text-center mx-auto">
            <h1 className="block font-extrabold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200 leading-tight">
              Accelerate Your Career with the{" "}
              <span className="bg-clip-text bg-gradient-to-tl from-emerald-600 to-cyan-600 text-transparent">
                AI Career Companion
              </span>
            </h1>
          </div>

          <div className="mt-5 max-w-3xl text-center mx-auto">
            <p className="text-lg text-gray-600 dark:text-neutral-400">
              Unlock expert career guidance, personalized job search insights,
              and AI-powered tools to advance at every stage of your journey.
            </p>
          </div>

          <div className="mt-8 gap-3 flex justify-center">
            <a
              className="inline-flex justify-center items-center gap-x-3 text-center bg-gradient-to-tl from-emerald-600 to-cyan-600 hover:from-cyan-600 hover:to-emerald-600 border border-transparent cursor-pointer text-white text-sm font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 py-3 px-6 transition-all"
              href="/dashboard"
            >
              Get Started
              <svg
                className="flex-shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Features Section - CENTERED & STATIC CARDS */}
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        {/* container centers the two cards horizontally and keeps responsiveness */}
        <div className="flex flex-col sm:flex-row justify-center items-start gap-8">
          {/* Career Q&A with AI (static - not clickable) */}
          <div
            role="article"
            aria-label="Career Q&A with AI"
            className="group flex flex-col justify-center hover:bg-emerald-50 rounded-xl p-6 md:p-8 transition-all dark:hover:bg-neutral-800 shadow-sm w-full max-w-sm border border-transparent"
          >
            <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl shadow-md">
              <svg
                className="flex-shrink-0 w-6 h-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="10" height="14" x="3" y="8" rx="2" />
                <path d="M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4" />
                <path d="M8 18h.01" />
              </svg>
            </div>

            <div className="mt-6 text-center">
              <h3 className="group-hover:text-emerald-700 text-lg font-semibold text-gray-800 dark:text-white dark:group-hover:text-emerald-400">
                Career Q&A with AI
              </h3>
              <p className="mt-3 text-gray-600 dark:text-neutral-400 text-sm leading-relaxed">
                Ask personalized career questions and get instant, actionable AI
                insights tailored to your industry and skills.
                Click Get Started to learn more.
              </p>

              {/* decorative static arrow (not clickable) */}
              <div className="mt-4 inline-flex items-center justify-center text-emerald-600 text-sm font-medium opacity-90">
                <span className="sr-only">Not clickable</span>
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* AI Resume Optimizer (static - not clickable) */}
          <div
            role="article"
            aria-label="AI Resume Optimizer"
            className="group flex flex-col justify-center hover:bg-emerald-50 rounded-xl p-6 md:p-8 transition-all dark:hover:bg-neutral-800 shadow-sm w-full max-w-sm border border-transparent"
          >
            <div className="flex justify-center items-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl shadow-md">
              <svg
                className="flex-shrink-0 w-6 h-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 7h-9" />
                <path d="M14 17H5" />
                <circle cx="17" cy="17" r="3" />
                <circle cx="7" cy="7" r="3" />
              </svg>
            </div>

            <div className="mt-6 text-center">
              <h3 className="group-hover:text-emerald-700 text-lg font-semibold text-gray-800 dark:text-white dark:group-hover:text-emerald-400">
                AI Resume Optimizer
              </h3>
              <p className="mt-3 text-gray-600 dark:text-neutral-400 text-sm leading-relaxed">
                Receive AI-powered feedback to refine your resume, improve ATS
                compatibility, and highlight your strengths effectively.
                Click Get Started to learn more.
              </p>

              {/* decorative static arrow (not clickable) */}
              <div className="mt-4 inline-flex items-center justify-center text-emerald-600 text-sm font-medium opacity-90">
                <span className="sr-only">Not clickable</span>
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
