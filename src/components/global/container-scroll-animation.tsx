'use client'
import React, { useRef } from 'react'
import { useScroll, useTransform, motion, MotionProps, HTMLMotionProps } from 'framer-motion'
import Image from 'next/image'

export const ContainerScroll = ({
  titleComponent,
}: {
  titleComponent: string | React.ReactNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef as React.RefObject<HTMLElement>,
  })
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1]
  }

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions())
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <div
      className="h-[80rem] flex items-center justify-center relative p-20"
      ref={containerRef}
    >
      <div
        className="py-40 w-full relative"
        style={{
          perspective: '1000px',
        }}
      >
        <Header
          translate={translate}
          titleComponent={titleComponent}
        />
        <Card
          rotate={rotate}
          translate={translate}
          scale={scale}
        />
      </div>
    </div>
  )
}

interface HeaderProps extends HTMLMotionProps<"div"> {
  translate: any;
  titleComponent: string | React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ 
  translate, 
  titleComponent, 
  ...props 
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
        ...props.style
      }}
      className={`div max-w-5xl mx-auto text-center ${props.className || ''}`}
      {...props}
    >
      {titleComponent}
    </motion.div>
  )
}

interface CardProps extends HTMLMotionProps<"div"> {
  rotate: any;
  scale: any;
  translate: any;
}

export const Card: React.FC<CardProps> = ({ 
  rotate, 
  scale, 
  translate, 
  ...props 
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
        ...props.style
      }}
      className={`max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full p-6 bg-[#222222] rounded-[30px] shadow-2xl ${props.className || ''}`}
      {...props}
    >
      <div className="bg-gray-100 h-full w-full rounded-2xl gap-4 overflow-hidden p-4 transition-all">
        <Image
          src="/temp-banner.png"
          fill
          alt="bannerImage"
          className="object-cover border-8 rounded-2xl"
        />
      </div>
    </motion.div>
  )
}