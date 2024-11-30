import"./modulepreload-polyfill-B5Qt9EMX.js";const s={html:`<h1>vite-plugin-faust</h1>
<p>Vite plugin to transform Faust DSP files into importable JavaScript (+ WASM) modules. Uses <a href="https://github.com/grame-cncm/faustwasm">faustwasm</a> under the hood.</p>
<h2>Installation</h2>
<pre class="shiki" style="background-color: #2e3440"><code><span style="color: #4C566A"># npm</span>
<span style="color: #D8DEE9FF">npm install --save-dev vite-plugin-faust</span>

<span style="color: #4C566A"># yarn</span>
<span style="color: #D8DEE9FF">yarn add -D vite-plugin-faust</span>

<span style="color: #4C566A"># pnpm</span>
<span style="color: #D8DEE9FF">pnpm add -D vite-plugin-faust</span></code></pre>
<h2>Usage</h2>
<pre class="shiki" style="background-color: #2e3440"><code><span style="color: #4C566A">// vite.config.js</span>
<span style="color: #81A1C1">import</span><span style="color: #D8DEE9FF"> </span><span style="color: #8FBCBB">faust</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">from</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">vite-plugin-svgr</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span>

<span style="color: #81A1C1">export</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">default</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">{</span>
<span style="color: #ECEFF4">  </span><span style="color: #4C566A">// ...</span>
<span style="color: #D8DEE9FF">  </span><span style="color: #88C0D0">plugins</span><span style="color: #ECEFF4">:</span><span style="color: #D8DEE9FF"> [</span><span style="color: #88C0D0">faust</span><span style="color: #D8DEE9FF">()]</span><span style="color: #ECEFF4">,</span>
<span style="color: #ECEFF4">}</span><span style="color: #81A1C1">;</span></code></pre>
<p>Then DSP files can be imported as modules:</p>
<pre class="shiki" style="background-color: #2e3440"><code><span style="color: #81A1C1">import</span><span style="color: #D8DEE9FF"> </span><span style="color: #8FBCBB">createReverb</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">from</span><span style="color: #D8DEE9FF"> </span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">./Reverb.dsp</span><span style="color: #ECEFF4">"</span><span style="color: #81A1C1">;</span>

<span style="color: #4C566A">// ...</span>
<span style="color: #81A1C1">const</span><span style="color: #D8DEE9FF"> </span><span style="color: #D8DEE9">reverb</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">=</span><span style="color: #D8DEE9FF"> </span><span style="color: #81A1C1">await</span><span style="color: #D8DEE9FF"> </span><span style="color: #88C0D0">createReverb</span><span style="color: #D8DEE9FF">(</span><span style="color: #88C0D0">liveAudioContext</span><span style="color: #D8DEE9FF">())</span><span style="color: #81A1C1">;</span>
<span style="color: #D8DEE9">reverb</span><span style="color: #ECEFF4">.</span><span style="color: #D8DEE9">faustNode</span><span style="color: #81A1C1">;</span><span style="color: #D8DEE9FF"> </span><span style="color: #4C566A">// is an AudioWorkletNode</span>
<span style="color: #D8DEE9">reverb</span><span style="color: #ECEFF4">.</span><span style="color: #D8DEE9">dspMeta</span><span style="color: #81A1C1">;</span><span style="color: #D8DEE9FF"> </span><span style="color: #4C566A">// contains a bunch of meta information about this node</span></code></pre>
<p>If you are using TypeScript, there is also a declaration helper for better type inference. Add the following to <code>vite-env.d.ts</code> (or <code>env.d.ts</code>, or whatever declaration file you chose to use):</p>
<pre class="shiki" style="background-color: #2e3440"><code><span style="color: #4C566A">/// </span><span style="color: #81A1C1">&lt;reference</span><span style="color: #4C566A"> </span><span style="color: #8FBCBB">types</span><span style="color: #81A1C1">=</span><span style="color: #ECEFF4">"</span><span style="color: #A3BE8C">vite-plugin-faust/client</span><span style="color: #ECEFF4">"</span><span style="color: #4C566A"> </span><span style="color: #81A1C1">/&gt;</span></code></pre>
<h2>Options</h2>
<p>None at the moment!</p>
<h2>License</h2>
<p>MIT</p>
`,metadata:{},filename:"README.md",path:"/Users/kevin/Develop/play_play/pkg/packages/vite-plugin-faust/README.md"};document.getElementById("root").innerHTML=s.html;
