import Image from "next/image";
import styled from "styled-components";

import Download from "@/components/Download";
// import {useEffect} from "react";

export default function Home() {

// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above

    // useEffect(() => {


    // })


    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                {/*<Container>*/}
                <Download/>
                {/*</Container>*/}
            </main>
        </div>
    );
}


// const Container = styled.div``