import {NextRequest} from 'next/server';

import ytdl from "@distube/ytdl-core";

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);
        const url = searchParams.get('url');

        if (!url || !ytdl.validateURL(url)) {
            return new Response(JSON.stringify({error: '유효한 YouTube URL을 제공하세요.'}), {status: 400});
        }

        const video = ytdl(url, {filter: 'audioonly'});
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title;


        // 스트리밍 응답 설정
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Response(video as any, {
            headers: {
                'Content-Disposition': `attachment; filename=${encodeURIComponent(title)}.webm"`,
                'Content-Type': 'audio/webm',
                'X-Filename': encodeURIComponent(title),
            },
        });
    } catch (error) {
        console.error('❌ API 에러:', error);
        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            detail: (error as Error).message, // 이거 추가!
        }), {
            status: 500,
            headers: {'Content-Type': 'application/json'}
        });
    }
}