import"./modulepreload-polyfill-wMinxHhO.js";var e={html:`<h1>vite-plugin-faust</h1>
<p>Vite plugin to transform Faust DSP files into importable JavaScript (+ WASM) modules. Uses <a href="https://github.com/grame-cncm/faustwasm">faustwasm</a> under the hood.</p>
<h2>Installation</h2>
<pre class="shiki nord" style="background-color:#2e3440ff;color:#d8dee9ff" tabindex="0"><code><span class="line"><span style="color:#616E88"># npm</span></span>
<span class="line"><span style="color:#88C0D0">npm</span><span style="color:#A3BE8C"> install</span><span style="color:#A3BE8C"> --save-dev</span><span style="color:#A3BE8C"> vite-plugin-faust</span></span>
<span class="line"></span>
<span class="line"><span style="color:#616E88"># yarn</span></span>
<span class="line"><span style="color:#88C0D0">yarn</span><span style="color:#A3BE8C"> add</span><span style="color:#A3BE8C"> -D</span><span style="color:#A3BE8C"> vite-plugin-faust</span></span>
<span class="line"></span>
<span class="line"><span style="color:#616E88"># pnpm</span></span>
<span class="line"><span style="color:#88C0D0">pnpm</span><span style="color:#A3BE8C"> add</span><span style="color:#A3BE8C"> -D</span><span style="color:#A3BE8C"> vite-plugin-faust</span></span>
<span class="line"></span></code></pre>
<h2>Usage</h2>
<pre class="shiki nord" style="background-color:#2e3440ff;color:#d8dee9ff" tabindex="0"><code><span class="line"><span style="color:#616E88">// vite.config.js</span></span>
<span class="line"><span style="color:#81A1C1">import</span><span style="color:#8FBCBB"> faust</span><span style="color:#81A1C1"> from</span><span style="color:#ECEFF4"> "</span><span style="color:#A3BE8C">vite-plugin-svgr</span><span style="color:#ECEFF4">"</span><span style="color:#81A1C1">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#81A1C1">export</span><span style="color:#81A1C1"> default</span><span style="color:#ECEFF4"> {</span></span>
<span class="line"><span style="color:#616E88">  // ...</span></span>
<span class="line"><span style="color:#88C0D0">  plugins</span><span style="color:#ECEFF4">:</span><span style="color:#D8DEE9FF"> [</span><span style="color:#88C0D0">faust</span><span style="color:#D8DEE9FF">()]</span><span style="color:#ECEFF4">,</span></span>
<span class="line"><span style="color:#ECEFF4">}</span><span style="color:#81A1C1">;</span></span>
<span class="line"></span></code></pre>
<p>Then DSP files can be imported as modules:</p>
<pre class="shiki nord" style="background-color:#2e3440ff;color:#d8dee9ff" tabindex="0"><code><span class="line"><span style="color:#81A1C1">import</span><span style="color:#8FBCBB"> createReverb</span><span style="color:#81A1C1"> from</span><span style="color:#ECEFF4"> "</span><span style="color:#A3BE8C">./Reverb.dsp</span><span style="color:#ECEFF4">"</span><span style="color:#81A1C1">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#616E88">// ...</span></span>
<span class="line"><span style="color:#81A1C1">const</span><span style="color:#D8DEE9"> reverb</span><span style="color:#81A1C1"> =</span><span style="color:#81A1C1"> await</span><span style="color:#88C0D0"> createReverb</span><span style="color:#D8DEE9FF">(</span><span style="color:#88C0D0">liveAudioContext</span><span style="color:#D8DEE9FF">())</span><span style="color:#81A1C1">;</span></span>
<span class="line"><span style="color:#D8DEE9">reverb</span><span style="color:#ECEFF4">.</span><span style="color:#D8DEE9">faustNode</span><span style="color:#81A1C1">;</span><span style="color:#616E88"> // is an AudioWorkletNode</span></span>
<span class="line"><span style="color:#D8DEE9">reverb</span><span style="color:#ECEFF4">.</span><span style="color:#D8DEE9">dspMeta</span><span style="color:#81A1C1">;</span><span style="color:#616E88"> // contains a bunch of meta information about this node</span></span>
<span class="line"></span></code></pre>
<p>If you are using TypeScript, there is also a declaration helper for better type inference. Add the following to <code>vite-env.d.ts</code> (or <code>env.d.ts</code>, or whatever declaration file you chose to use):</p>
<pre class="shiki nord" style="background-color:#2e3440ff;color:#d8dee9ff" tabindex="0"><code><span class="line"><span style="color:#616E88">/// </span><span style="color:#81A1C1">&#x3C;reference</span><span style="color:#8FBCBB"> types</span><span style="color:#81A1C1">=</span><span style="color:#ECEFF4">"</span><span style="color:#A3BE8C">vite-plugin-faust/client</span><span style="color:#ECEFF4">"</span><span style="color:#81A1C1"> /></span></span>
<span class="line"></span></code></pre>
<h2>Options</h2>
<p>None at the moment!</p>
<h2>License</h2>
<p>MIT</p>
`,metadata:{},filename:`README.md`,path:`/Users/kevin/Develop/play_play/pkg/packages/vite-plugin-faust/README.md`};document.getElementById(`root`).innerHTML=e.html;