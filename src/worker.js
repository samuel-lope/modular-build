/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 * primeira versão estável
 */

export default {
  async fetch(request, env, ctx) {
    console.info({ message: 'Worker Executado com Sucesso!' });
    return new Response('Olá Mundo!');
  }
};
