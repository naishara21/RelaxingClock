import { SpotifyClient } from '../../lib/spotify/SpotifyClient';
import { shortcuts } from '../../stores/rooster';
import { inQueue } from '../../stores/spotify';
import type { RoosterExample, RoosterExamples } from '../../types';
import { device_id } from './player';

async function loadSearch(query: string, type: 'album'| 'playlist' | 'track' | 'search'): Promise<RoosterExamples> {
    let toQueue = false;

    if (!query || query.length < 2) return {};
    else if (query.endsWith('>>') || query.endsWith('>')) {
        toQueue = true; query = query.replace(/>+$/g, '');
    }

    if (type === 'search') type = 'track';
    const res = await SpotifyClient.search(query, [type], { limit: 5 });
    
    let examples: RoosterExamples = {};
    for (const key of (Object.keys(res))) {
        const list: RoosterExample[] = res[key].items.map((item) => {
            let artist = '';
            if (item.artists) item.artists.forEach(a => artist += ` ${a.name}`) 
            const image = key === 'tracks' ? item.album.images[item.album.images.length - 1].url : item.images[item.images.length - 1].url;
            
            return {'example': item.name, 'tip': artist, image, 'selectable': true, 'id': (toQueue ? '>>queue<<' : '') + item.uri};
        });

        examples.group = list;
    }
    
    examples.namespace = type;
    return examples;
}

export function createShortcuts() {
    shortcuts.set('spotify', {
        background: process.env.SPOTIFY_COLOR,
        color: process.env.BACKGROUND_DARK,
        arguments: {
            track: {
                async callback(p, id: string) {
                    try {
                        if (id.startsWith('>>queue<<')) {
                            await SpotifyClient.queue(id.replace(/^>>queue<</, ''));
                            inQueue.set(true);
                        }

                        else await SpotifyClient.play({uris: [id], device_id});
                        return true;
                    } catch(err) {
                        console.log(err);
                        return false;
                    }
                }
            },
            search: {
                async callback(p, id) {
                    console.log(p, id);
                    
                    return true;
                }
            },
            playlist: {
                async callback(p) {
                    
                    return true;
                }
            },
            album: {
                async callback(p) {
                    
                    return true;
                }
            },
            pause: {
                async callback() {
                    try { await SpotifyClient.pause({device_id}); return true;}
                    catch(e) { console.error(e); return false;}
                }
            }
        }, 
        async examples(arg, params) {
            if (['search','album','playlist', 'track'].find(a => a === arg)) {
                //@ts-ignore
                return loadSearch(params, arg);
            }

            return null;
        }
    })
}
