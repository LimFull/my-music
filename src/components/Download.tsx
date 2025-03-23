'use client'

import {ChangeEvent, JSX, useEffect, useRef, useState} from "react";
import {FFmpeg} from "@ffmpeg/ffmpeg";
import {fetchFile, toBlobURL} from "@ffmpeg/util";
import styled from "styled-components";


function Download(): JSX.Element {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [inputUrl, setInputUrl] = useState<string>('');
    const ffmpegRef = useRef<FFmpeg | null>(null);


    const loadFFmpeg = async () => {
        if (typeof window === 'undefined') return; // ✅ 서버에서 실행 방지

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const FF = (await import('@ffmpeg/ffmpeg')).FFmpeg;
        const ffmpeg = new FF();

        ffmpeg.on('log', ({message}) => console.log(message));

        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegRef.current = ffmpeg;
        setIsLoaded(true);
    };

    const handleConvert = async () => {
        try {

            // 1. YouTube 오디오 다운로드 (.webm 등)
            setIsDownloading(true);
            const response = await fetch(`${window.location.origin}/api/hello?url=${inputUrl}`);

            if (!response.ok) {
                alert('다운로드 실패');
                setIsDownloading(false);
                return;
            }

            const filename =
                decodeURIComponent(response.headers.get('X-Filename') || 'audio') + '.mp3';
            const webmBlob = await response.blob();

            // 2. ffmpeg.wasm 로드
            if (!isLoaded) {
                await loadFFmpeg();
            }

            // 3. WebM 파일 → FFmpeg 가상 파일 시스템에 넣기
            const ffmpeg = ffmpegRef.current;
            await ffmpeg?.writeFile('input.webm', await fetchFile(webmBlob));

            // 4. 변환: .webm → .mp3
            await ffmpeg?.exec(['-i', 'input.webm', '-b:a', '192k', '-codec:a', 'libmp3lame', 'output.mp3']);

            // 5. 변환된 파일 읽기
            const data = await ffmpeg?.readFile('output.mp3');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mp3Blob = new Blob([(data as any)?.buffer], {type: 'audio/mpeg'});
            const url = URL.createObjectURL(mp3Blob);


            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // 원하는 파일명 지정
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setIsDownloading(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            alert(e);
            console.error(e);
            setIsDownloading(false);
        }
    };


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputUrl(e.target.value);
    }


    useEffect(() => {
        loadFFmpeg();
    }, [])

    return (
        <div>
            {
                !isLoaded && <Loading>로딩 중..</Loading>
            }
            {
                isLoaded &&
                <Container>
                    <Input placeholder={'유튜브 주소 입력'} onChange={handleChange}/>
                    {!isDownloading && <DownloadButton onClick={handleConvert}>다운로드</DownloadButton>}
                    {isDownloading && <Downloading>다운로드 중..</Downloading>}
                </Container>
            }

        </div>
    );
}

const Downloading = styled.div``

const Input = styled.input`
    border-radius: 48px;
    height: 48px;
    font-size: 16px;
    color: #25262C;
    background: #F7F7F8;
    width: 500px;
    padding: 0 16px;
    outline: none;
`

const DownloadButton = styled.button`
    cursor: pointer;
    border-radius: 56px;
    height: 58px;
    background: #25262C;
    color: white;
    font-size: 16px;
    width: 200px;
`

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
`

const Loading = styled.div``

export default Download;