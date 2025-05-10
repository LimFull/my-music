import {NextRequest} from 'next/server';
import {exec} from 'child_process';
import {promisify} from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// function sanitizeFilename(filename: string) {
//     // Windows, macOS, Linux에서 문제없는 파일명으로 필터링
//     return filename
//         .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
//         .replace(/[\u{0080}-\u{FFFF}]/gu, '') // 고확률 비ASCII 제거 (선택사항)
//         .trim();
// }

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);
        const url = searchParams.get('url');

        if (!url || !/^https?:\/\/(www\.)?youtube\.com|youtu\.be/.test(url)) {
            return new Response(JSON.stringify({error: '유효한 YouTube URL을 제공하세요.'}), {status: 400});
        }

        const tempDir = '/tmp';

        // 1. 제목 가져오기
        const {stdout: rawTitle} = await execAsync(`yt-dlp --get-title "${url}"`);
        const title = rawTitle.trim();
        // const safeTitle = sanitizeFilename(title) || `yt-audio-${Date.now()}`;

        // 2. ASCII-safe 임시 경로로 저장
        const outputPath = path.join(tempDir, `yt-audio-${Date.now()}.mp3`);

        // 3. 다운로드
        await execAsync(`yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`);

        // 4. 파일 읽기
        const fileBuffer = await fs.readFile(outputPath);

        // 5. 응답 (다운로드 파일명만 한글 제목 사용)
        return new Response(fileBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.mp3"; filename*=UTF-8''${encodeURIComponent(title)}.mp3`,
                'Content-Type': 'audio/mpeg',
                'X-Filename': encodeURIComponent(title),
            },
        });
    } catch (error) {
        console.error('❌ yt-dlp 에러:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal Server Error',
                detail: (error as Error).message,
            }),
            {
                status: 500,
                headers: {'Content-Type': 'application/json'},
            }
        );
    }
}