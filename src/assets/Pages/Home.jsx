import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import callumPhoto from '../Callum.jpg'
import aaravPhoto from '../Aarav.jpeg'
import namanPhoto from '../Naman.png'
import tanPhoto from '../Tan.jpeg'
import emanuelPhoto from '../Emanuel.jpeg'
import './Home.css';

export default function Home() {
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const cleanupRef = useRef(null);
  const runTransRef = useRef(null);
  const [isLoggedIn] = useState(() => !!localStorage.getItem('nomnom_profile'));

  useEffect(() => {
    if (!wrapperRef.current) return;
    const root = wrapperRef.current;

    /* ═══ REFS ═══ */
    const nav = root.querySelector('#navbar');
    const sections = root.querySelectorAll('.scroll-section');
    const cards3d = root.querySelectorAll('.card-3d');
    const btn3dWraps = root.querySelectorAll('.btn-3d-wrap');
    const sinePath = root.querySelector('#sineWavePath');
    const SINE_FREQ = 0.04, SINE_AMP = 4.5;
    let lastScroll = 0;
    let wavePhase = 0;
    let currentPct = 0;
    let waveRAF = null;

    function drawSineWave(endX, phase) {
      if (endX < 1) { sinePath.setAttribute('d', ''); return; }
      let d = 'M 0 0';
      for (let x = 0; x <= endX; x += 4) {
        d += ' L ' + x + ' ' + (7 + Math.sin(x * SINE_FREQ + phase) * SINE_AMP).toFixed(1);
      }
      sinePath.setAttribute('d', d + ' L ' + endX + ' 0 Z');
    }

    function waveLoop() {
      wavePhase += 0.04;
      drawSineWave(currentPct * 1000, wavePhase);
      waveRAF = requestAnimationFrame(waveLoop);
    }
    waveRAF = requestAnimationFrame(waveLoop);

    /* ═══ HALFTONE ═══ */
    const HT_PAD = 78, CV_SC = 0.5, GR_SZ = 5, MAX_R = GR_SZ * 0.46;
    const GS = [[0,210,235],[250,200,60],[230,55,140]];
    const GD = -25 * Math.PI / 180, GC = Math.cos(GD), GSN = Math.sin(GD);

    function mkHT(par) {
      const w = document.createElement('div'); w.className = 'halftone-shadow-wrap';
      const c = document.createElement('canvas'); w.appendChild(c);
      par.insertBefore(w, par.firstChild);
      return { wrap: w, cvs: c, ctx: c.getContext('2d'), sized: false, w: 0, h: 0 };
    }
    function szHT(ht, el) {
      const r = el.getBoundingClientRect();
      const w = Math.round((r.width + HT_PAD * 2) * CV_SC);
      const h = Math.round((r.height + HT_PAD * 2) * CV_SC);
      if (ht.cvs.width !== w || ht.cvs.height !== h) { ht.cvs.width = w; ht.cvs.height = h; }
      ht.w = w; ht.h = h; ht.sized = true;
    }
    function drawHT(ht, cx, cy, int, ew, eh, sx, sy) {
      const ctx = ht.ctx; const w = ht.w; const h = ht.h;
      ctx.clearRect(0, 0, w, h);
      if (int < 0.01) return;
      const sp = Math.sqrt(ew * ew + eh * eh) * CV_SC * 0.5;
      const di = 1 / Math.sqrt(w * w + h * h);
      const isx = 1 / (sp * sx), isy = 1 / (sp * sy);
      for (let gx = 0; gx < w; gx += GR_SZ) {
        for (let gy = 0; gy < h; gy += GR_SZ) {
          const dx = (gx - cx) * isx, dy = (gy - cy) * isy;
          const d = Math.sqrt(dx * dx + dy * dy), f = 1 - d;
          if (f <= 0.02) continue;
          const dI = f * f * int, r = MAX_R * dI;
          if (r < 0.25) continue;
          const pr = (gx * GC + gy * GSN) * di;
          const t = Math.max(0, Math.min(1, pr * 0.9 + 0.5));
          let cr, cg, cb;
          if (t < 0.5) { const u = t * 2; cr = GS[0][0]+(GS[1][0]-GS[0][0])*u; cg = GS[0][1]+(GS[1][1]-GS[0][1])*u; cb = GS[0][2]+(GS[1][2]-GS[0][2])*u; }
          else { const u2 = (t-0.5)*2; cr = GS[1][0]+(GS[2][0]-GS[1][0])*u2; cg = GS[1][1]+(GS[2][1]-GS[1][1])*u2; cb = GS[1][2]+(GS[2][2]-GS[1][2])*u2; }
          ctx.beginPath(); ctx.arc(gx, gy, r, 0, 6.2832);
          ctx.fillStyle = 'rgba(' + (cr|0) + ',' + (cg|0) + ',' + (cb|0) + ',' + (dI * 0.6).toFixed(3) + ')';
          ctx.fill();
        }
      }
    }

    /* ═══ SCRIBBLE BG ═══ */
    const bgSL = root.querySelector('#bgScribbles');
    const bgSC = [{h:0,s:60,l:50},{h:45,s:65,l:50},{h:0,s:0,l:30},{h:0,s:0,l:65},{h:345,s:55,l:48},{h:210,s:40,l:55},{h:25,s:50,l:45}];

    function m32(a) { return function() { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return((t^t>>>14)>>>0)/4294967296; }; }

    function genFood(w, h, seed, hue) {
      const rng = m32(seed), j = (a) => (rng()-0.5)*a;
      const cx = w*0.5, cy = h*0.5, type = Math.floor(rng()*12);
      const sW = 3+rng()*3, op = 0.3+rng()*0.2, sH = hue+(rng()-0.5)*30, shapes = [];
      if (type===0) {
        const tip = {x:cx+j(4), y:cy+40+j(4)};
        const lx=cx-35+j(4), ly=cy-30+j(4), rx2=cx+35+j(4), ry2=cy-30+j(4);
        shapes.push({d:'M '+tip.x+' '+tip.y+' L '+lx+' '+ly+' Q '+cx+' '+(ly-18+j(4))+' '+rx2+' '+ry2+' Z',hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-8+j(3))+' '+(cy-5+j(3))+' a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',hue:sH+20,strokeW:sW*0.8,opacity:op});
        shapes.push({d:'M '+(cx+8+j(3))+' '+(cy+12+j(3))+' a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0',hue:sH+20,strokeW:sW*0.8,opacity:op});
        shapes.push({d:'M '+(cx-14+j(3))+' '+(cy+15+j(3))+' a 3.5 3.5 0 1 0 7 0 a 3.5 3.5 0 1 0 -7 0',hue:sH+20,strokeW:sW*0.8,opacity:op});
      } else if (type===1) {
        const bw=50+rng()*15, bd=25+rng()*10;
        shapes.push({d:'M '+(cx-bw)+' '+cy+' Q '+(cx-bw*0.8)+' '+(cy+bd*1.8)+' '+cx+' '+(cy+bd*1.6)+' Q '+(cx+bw*0.8)+' '+(cy+bd*1.8)+' '+(cx+bw)+' '+cy,hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-bw-4)+' '+cy+' Q '+cx+' '+(cy-12+j(3))+' '+(cx+bw+4)+' '+cy,hue:sH,strokeW:sW*1.2,opacity:op});
        shapes.push({d:'M '+(cx-12+j(4))+' '+(cy-8)+' Q '+(cx-16+j(3))+' '+(cy-25)+' '+(cx-10+j(4))+' '+(cy-38),hue:sH,strokeW:sW*0.6,opacity:op*0.6});
        shapes.push({d:'M '+(cx+10+j(4))+' '+(cy-8)+' Q '+(cx+16+j(3))+' '+(cy-28)+' '+(cx+8+j(4))+' '+(cy-42),hue:sH,strokeW:sW*0.6,opacity:op*0.6});
      } else if (type===2) {
        const fy=cy-45, by=cy+45, tw=6;
        shapes.push({d:'M '+cx+' '+by+' L '+cx+' '+(fy+20),hue:sH,strokeW:sW*1.2,opacity:op});
        shapes.push({d:'M '+(cx-tw*2)+' '+fy+' L '+(cx-tw*2)+' '+(fy+25),hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-tw)+' '+fy+' L '+(cx-tw)+' '+(fy+25),hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+cx+' '+fy+' L '+cx+' '+(fy+25),hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx+tw)+' '+fy+' L '+(cx+tw)+' '+(fy+25),hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-tw*2)+' '+(fy+25)+' Q '+cx+' '+(fy+32)+' '+(cx+tw)+' '+(fy+25),hue:sH,strokeW:sW,opacity:op});
      } else if (type===3) {
        shapes.push({d:'M '+cx+' '+(cy+45)+' L '+cx+' '+(cy-5),hue:sH,strokeW:sW*1.2,opacity:op});
        shapes.push({d:'M '+(cx-16)+' '+(cy-25)+' Q '+(cx-18)+' '+(cy-50)+' '+cx+' '+(cy-52)+' Q '+(cx+18)+' '+(cy-50)+' '+(cx+16)+' '+(cy-25)+' Q '+cx+' '+(cy-8)+' '+(cx-16)+' '+(cy-25)+' Z',hue:sH,strokeW:sW,opacity:op});
      } else if (type===4) {
        const cw=30+rng()*10, ch2=40+rng()*10;
        shapes.push({d:'M '+(cx-cw)+' '+(cy-ch2*0.3)+' L '+(cx-cw*0.8)+' '+(cy+ch2*0.7)+' Q '+cx+' '+(cy+ch2*0.85)+' '+(cx+cw*0.8)+' '+(cy+ch2*0.7)+' L '+(cx+cw)+' '+(cy-ch2*0.3)+' Z',hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx+cw)+' '+(cy-ch2*0.1)+' Q '+(cx+cw+18)+' '+cy+' '+(cx+cw)+' '+(cy+ch2*0.35),hue:sH,strokeW:sW*1.3,opacity:op});
        shapes.push({d:'M '+(cx-8)+' '+(cy-ch2*0.3-5)+' C '+(cx-14)+' '+(cy-ch2*0.3-20)+' '+(cx-2)+' '+(cy-ch2*0.3-28)+' '+(cx-10)+' '+(cy-ch2*0.3-42),hue:sH,strokeW:sW*0.5,opacity:op*0.5});
        shapes.push({d:'M '+(cx+8)+' '+(cy-ch2*0.3-5)+' C '+(cx+14)+' '+(cy-ch2*0.3-22)+' '+(cx+2)+' '+(cy-ch2*0.3-30)+' '+(cx+10)+' '+(cy-ch2*0.3-45),hue:sH,strokeW:sW*0.5,opacity:op*0.5});
      } else if (type===5) {
        const pr=45+rng()*10;
        let d2=''; const pts2=24;
        for(let i2=0;i2<=pts2;i2++){const a2=(i2/pts2)*Math.PI*2;d2+=(i2===0?'M':'L')+' '+(cx+Math.cos(a2)*pr+j(2))+' '+(cy+Math.sin(a2)*(pr*0.45)+j(2));}d2+=' Z';
        shapes.push({d:d2,hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-pr*0.5)+' '+(cy+2)+' Q '+(cx-pr*0.2)+' '+(cy-pr*0.4)+' '+cx+' '+(cy-pr*0.35)+' Q '+(cx+pr*0.2)+' '+(cy-pr*0.4)+' '+(cx+pr*0.5)+' '+(cy+2),hue:sH+30,strokeW:sW*0.8,opacity:op});
      } else if (type===6) {
        const buw=42+rng()*10, buh=8;
        shapes.push({d:'M '+(cx-buw)+' '+cy+' Q '+(cx-buw)+' '+(cy-buh*4)+' '+cx+' '+(cy-buh*4)+' Q '+(cx+buw)+' '+(cy-buh*4)+' '+(cx+buw)+' '+cy,hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-buw-3)+' '+(cy+4)+' L '+(cx+buw+3)+' '+(cy+4),hue:sH+15,strokeW:sW*2.5,opacity:op});
        shapes.push({d:'M '+(cx-buw-2)+' '+(cy+12)+' Q '+(cx-buw*0.5)+' '+(cy+7)+' '+cx+' '+(cy+13)+' Q '+(cx+buw*0.5)+' '+(cy+7)+' '+(cx+buw+2)+' '+(cy+12),hue:sH+60,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-buw)+' '+(cy+16)+' Q '+(cx-buw)+' '+(cy+buh*3.5)+' '+cx+' '+(cy+buh*3.5)+' Q '+(cx+buw)+' '+(cy+buh*3.5)+' '+(cx+buw)+' '+(cy+16),hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-12)+' '+(cy-buh*3)+' a 2 3 20 1 0 4 0 a 2 3 20 1 0 -4 0',hue:sH,strokeW:sW*0.5,opacity:op*0.7});
        shapes.push({d:'M '+(cx+10)+' '+(cy-buh*2.5)+' a 2 3 -15 1 0 4 0 a 2 3 -15 1 0 -4 0',hue:sH,strokeW:sW*0.5,opacity:op*0.7});
      } else if (type===7) {
        shapes.push({d:'M '+cx+' '+(cy+50)+' L '+cx+' '+(cy-10),hue:sH,strokeW:sW*1.3,opacity:op});
        shapes.push({d:'M '+cx+' '+(cy-10)+' L '+(cx+3)+' '+(cy-50)+' L '+(cx-1)+' '+(cy-50)+' Q '+(cx-8)+' '+(cy-45)+' '+(cx-5)+' '+(cy-10)+' Z',hue:sH,strokeW:sW*0.8,opacity:op});
        shapes.push({d:'M '+(cx-5)+' '+(cy+10)+' L '+(cx+5)+' '+(cy+10),hue:sH,strokeW:sW*0.5,opacity:op*0.5});
        shapes.push({d:'M '+(cx-5)+' '+(cy+20)+' L '+(cx+5)+' '+(cy+20),hue:sH,strokeW:sW*0.5,opacity:op*0.5});
      } else if (type===8) {
        shapes.push({d:'M '+(cx-22)+' '+(cy-8)+' L '+cx+' '+(cy+50)+' L '+(cx+22)+' '+(cy-8),hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-14)+' '+(cy+5)+' L '+(cx+14)+' '+(cy+5),hue:sH,strokeW:sW*0.4,opacity:op*0.4});
        shapes.push({d:'M '+(cx-8)+' '+(cy+20)+' L '+(cx+8)+' '+(cy+20),hue:sH,strokeW:sW*0.4,opacity:op*0.4});
        shapes.push({d:'M '+(cx-24)+' '+(cy-8)+' Q '+(cx-26)+' '+(cy-35)+' '+(cx-6)+' '+(cy-38)+' Q '+(cx+2)+' '+(cy-55)+' '+(cx+14)+' '+(cy-40)+' Q '+(cx+28)+' '+(cy-35)+' '+(cx+24)+' '+(cy-8),hue:sH+40,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx+4)+' '+(cy-52)+' Q '+(cx+8)+' '+(cy-62)+' '+(cx+4)+' '+(cy-65),hue:sH-30,strokeW:sW*0.6,opacity:op});
        shapes.push({d:'M '+cx+' '+(cy-52)+' a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',hue:sH-30,strokeW:sW*0.8,opacity:op});
      } else if (type===9) {
        const dr=32+rng()*8, ir=12+rng()*4;
        let d3='',d4=''; const pts3=24;
        for(let i3=0;i3<=pts3;i3++){const a3=(i3/pts3)*Math.PI*2;d3+=(i3===0?'M':'L')+' '+(cx+Math.cos(a3)*dr+j(2))+' '+(cy+Math.sin(a3)*dr+j(2));}d3+=' Z';
        for(let i4=0;i4<=pts3;i4++){const a4=(i4/pts3)*Math.PI*2;d4+=(i4===0?'M':'L')+' '+(cx+Math.cos(a4)*ir+j(1.5))+' '+(cy+Math.sin(a4)*ir+j(1.5));}d4+=' Z';
        shapes.push({d:d3,hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:d4,hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-dr*0.7)+' '+(cy-dr*0.3)+' Q '+(cx-dr*0.3)+' '+(cy-dr*0.8)+' '+cx+' '+(cy-dr*0.6)+' Q '+(cx+dr*0.3)+' '+(cy-dr*0.8)+' '+(cx+dr*0.7)+' '+(cy-dr*0.3),hue:sH+50,strokeW:sW*1.5,opacity:op*0.7});
      } else if (type===10) {
        const sw2=48+rng()*10;
        shapes.push({d:'M '+(cx-sw2)+' '+(cy+5)+' Q '+(cx-sw2*0.7)+' '+(cy+50)+' '+cx+' '+(cy+45)+' Q '+(cx+sw2*0.7)+' '+(cy+50)+' '+(cx+sw2)+' '+(cy+5),hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-sw2-5)+' '+(cy+5)+' Q '+cx+' '+(cy-10)+' '+(cx+sw2+5)+' '+(cy+5),hue:sH,strokeW:sW*1.3,opacity:op});
        shapes.push({d:'M '+(cx-sw2*0.6)+' '+(cy+12)+' Q '+cx+' '+(cy+5)+' '+(cx+sw2*0.6)+' '+(cy+12),hue:sH+20,strokeW:sW*0.6,opacity:op*0.5});
        shapes.push({d:'M '+(cx-15)+' '+(cy-5)+' C '+(cx-20)+' '+(cy-20)+' '+(cx-8)+' '+(cy-25)+' '+(cx-15)+' '+(cy-40),hue:sH,strokeW:sW*0.5,opacity:op*0.4});
        shapes.push({d:'M '+cx+' '+(cy-5)+' C '+(cx+6)+' '+(cy-22)+' '+(cx-6)+' '+(cy-28)+' '+(cx+2)+' '+(cy-44),hue:sH,strokeW:sW*0.5,opacity:op*0.4});
      } else {
        const cuw=28+rng()*8;
        shapes.push({d:'M '+(cx-cuw)+' '+(cy+5)+' L '+(cx-cuw*0.7)+' '+(cy+40)+' L '+(cx+cuw*0.7)+' '+(cy+40)+' L '+(cx+cuw)+' '+(cy+5)+' Z',hue:sH,strokeW:sW,opacity:op});
        shapes.push({d:'M '+(cx-cuw*0.85)+' '+(cy+8)+' L '+(cx-cuw*0.6)+' '+(cy+38),hue:sH,strokeW:sW*0.4,opacity:op*0.4});
        shapes.push({d:'M '+(cx+cuw*0.85)+' '+(cy+8)+' L '+(cx+cuw*0.6)+' '+(cy+38),hue:sH,strokeW:sW*0.4,opacity:op*0.4});
        shapes.push({d:'M '+(cx-cuw*1.1)+' '+(cy+5)+' Q '+(cx-cuw*0.6)+' '+(cy-15)+' '+cx+' '+(cy-10)+' Q '+(cx+cuw*0.6)+' '+(cy-15)+' '+(cx+cuw*1.1)+' '+(cy+5),hue:sH+40,strokeW:sW*1.5,opacity:op});
        shapes.push({d:'M '+(cx-cuw*0.7)+' '+(cy-8)+' Q '+(cx-cuw*0.3)+' '+(cy-28)+' '+cx+' '+(cy-25)+' Q '+(cx+cuw*0.3)+' '+(cy-28)+' '+(cx+cuw*0.7)+' '+(cy-8),hue:sH+40,strokeW:sW*1.2,opacity:op});
        shapes.push({d:'M '+(cx-1)+' '+(cy-30)+' a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',hue:sH-20,strokeW:sW*0.8,opacity:op});
      }
      return shapes;
    }

    function spawnBG() {
      const count = 5+Math.floor(Math.random()*4);
      const group = document.createElement('div');
      group.className = 'bg-scribble-group';
      const placed = [];
      for (let i = 0; i < count; i++) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 300 200');
        svg.setAttribute('preserveAspectRatio','none');
        let x, y, att = 0;
        do { x=5+Math.random()*90; y=5+Math.random()*90; att++; } while(att<30 && placed.some(p => Math.sqrt((p.x-x)*(p.x-x)+(p.y-y)*(p.y-y))<30));
        placed.push({x,y});
        const sz = 80+Math.random()*160, rot = (Math.random()-0.5)*40;
        svg.style.left=x+'vw'; svg.style.top=y+'vh'; svg.style.width=sz+'px'; svg.style.height=(sz*0.66)+'px';
        svg.style.transform='rotate('+rot+'deg) translate(-50%,-50%)';
        const col = bgSC[Math.floor(Math.random()*bgSC.length)];
        const shapes = genFood(300,200,Math.floor(Math.random()*99999),col.h);
        shapes.forEach((shape, si) => {
          const path = document.createElementNS('http://www.w3.org/2000/svg','path');
          path.setAttribute('d', shape.d);
          path.style.stroke = 'hsla('+shape.hue+','+col.s+'%,'+col.l+'%,'+(shape.opacity*0.45)+')';
          path.style.strokeWidth = shape.strokeW * 0.8; path.style.fill = 'none';
          svg.appendChild(path);
          requestAnimationFrame(() => {
            const len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len; path.style.transition = 'none';
            requestAnimationFrame(() => { path.style.transition='stroke-dashoffset 0.9s cubic-bezier(0.25,0.1,0.25,1) '+(i*0.2+si*0.12)+'s'; path.style.strokeDashoffset='0'; });
          });
        });
        group.appendChild(svg);
      }
      bgSL.appendChild(group);
      return group;
    }
    function fadeBG(g) {
      const paths = g.querySelectorAll('path');
      paths.forEach((p,i) => { const len=p.getTotalLength(); p.style.transition='stroke-dashoffset 0.6s ease '+i*0.04+'s,opacity 0.6s ease '+i*0.04+'s'; p.style.strokeDashoffset=len; p.style.opacity='0'; });
      setTimeout(() => { if(g.parentNode) g.parentNode.removeChild(g); }, 2000);
    }
    let curBG = spawnBG();
    const bgInterval = setInterval(() => { fadeBG(curBG); setTimeout(() => { curBG = spawnBG(); }, 400); }, 5000);

    /* ═══ LOGO ═══ */
    const logoFonts = ["Playfair Display, serif","Abril Fatface, serif","Permanent Marker, cursive","Bebas Neue, sans-serif","Rubik Mono One, monospace","Bungee Shade, cursive","Fascinate Inline, cursive"];
    const logoChars = root.querySelectorAll('.logo-char');
    const logoRots = [-3, 2, -1.5, 2.5, -2, 1.5, -1, 1.5, 2.5];
    function pickFont(exc) { let p; do { p=logoFonts[Math.floor(Math.random()*logoFonts.length)]; } while(p===exc); return p; }
    const logoIntervals = [];
    logoChars.forEach((ch, i) => {
      let cur = pickFont(''); ch.style.fontFamily = cur; ch.style.transform = 'rotate('+logoRots[i]+'deg)';
      const tid = setTimeout(() => {
        const iid = setInterval(() => { cur=pickFont(cur); ch.style.fontFamily=cur; ch.style.transform='rotate('+logoRots[i]+'deg) scale(1.15)'; setTimeout(()=>{ch.style.transform='rotate('+logoRots[i]+'deg) scale(1)';},150); }, 2200);
        logoIntervals.push(iid);
      }, parseInt(ch.dataset.offset)*350);
      logoIntervals.push(tid);
    });

    /* ═══ MAG-CUT ═══ */
    const magT = root.querySelectorAll('.feature-card h3, .team-card h4');
    const magC = [{bg:'#FFE45C',border:'#d4b830'},{bg:'#D42B2B',border:'#a82222',light:true},{bg:'#1a1a1a',border:'#000',light:true},{bg:'#F2F0EC',border:'#d8d4cc'},{bg:'#FFE45C',border:'#d4b830'},{bg:'#D42B2B',border:'#a82222',light:true},{bg:'#FFF',border:'#d0d0d0'},{bg:'#1a1a1a',border:'#000',light:true}];
    let mI = 0;
    magT.forEach(el => {
      const wk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null); let nd=wk.nextNode();
      while(nd&&nd.textContent.trim()==='') nd=wk.nextNode(); if(!nd) return;
      const txt=nd.textContent, m=txt.match(/^(\s*)([\$A-Za-z])/); if(!m) return;
      const c=magC[mI%magC.length],fs=mI%6,rot=(((mI*7)%11)-5)*0.8;
      const sp=document.createElement('span'); sp.className='mag-cut mag-style-'+fs; sp.style.transform='rotate('+rot.toFixed(1)+'deg)';
      sp.innerHTML='<span class="mag-chip" style="background:'+c.bg+';border-color:'+c.border+';border-radius:'+(2+mI%4)+'px '+(4+mI%3)+'px '+(3+mI%5)+'px '+(2+mI%4)+'px;transform:rotate('+(rot*-0.3).toFixed(1)+'deg);"></span><span class="mag-letter" style="'+(c.light?'color:#fff;':'')+'">'+m[2]+'</span>';
      nd.textContent=txt.slice(m[1].length+1); nd.parentNode.insertBefore(document.createTextNode(m[1]),nd); nd.parentNode.insertBefore(sp,nd); mI++;
    });

    /* ═══ HIGHLIGHT SWEEPS ═══ */
    root.querySelectorAll('.highlight-bg').forEach((bg, i) => {
      const s=i*37,y1=2+(s%5),y2=1+(s%4),c1=-3-(s%4),c2=18+(s%6),sk=-1+(s%3);
      bg.innerHTML='<svg viewBox="0 0 200 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path class="sweep" d="M -2 '+(10+y1)+' C 30 '+c1+', 50 '+c2+', 100 '+(9+y2)+' C 150 '+(c1+14)+', 175 '+(c2-4)+', 202 '+(10+sk)+' L 202 22 C 170 '+(20+y1)+', 120 '+(18-y2)+', 100 20 C 60 '+(22+sk)+', 30 '+(18+y2)+', -2 '+(20+y1)+' Z" fill="#FFE45C" opacity="0.68"/></svg>';
    });

    /* ═══ CARD SETUP ═══ */
    cards3d.forEach((card, i) => {
      const inner = card.querySelector('.card-3d-inner');
      const emoji = card.dataset.emoji, tilt = parseInt(card.dataset.tilt)||0;
      if (emoji) {
        const el = document.createElement('div'); el.className = 'bg-emoji'; el.textContent = emoji;
        const isF = inner.classList.contains('feature-card');
        el.style.fontSize = isF ? '7rem' : '4.5rem';
        el.style.opacity = isF ? '0.15' : '0.12'; el.style.transform = 'rotate('+tilt+'deg)';
        el.dataset.opDefault = isF ? '0.15' : '0.12'; el.dataset.opHover = '0.6';
        inner.appendChild(el);
      }
      const sw = document.createElement('div'); sw.className = 'scribble-canvas';
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 300 200'); svg.setAttribute('preserveAspectRatio','none');
      sw.appendChild(svg); inner.insertBefore(sw, inner.firstChild);
      if (card.classList.contains('strip-stat')) {
        const seed=i*53; inner.style.borderRadius=(10+seed%14)+'px '+(4+seed%18)+'px '+(12+seed%10)+'px '+(5+seed%16)+'px';
        inner.style.transform='rotate('+(tilt*0.3).toFixed(1)+'deg)'; inner.style.border='1.5px solid rgba(0,0,0,0.1)';
        inner.style.boxShadow='2px 3px 8px rgba(0,0,0,0.06),-1px -1px 4px rgba(0,0,0,0.03)';
      }
    });

    /* ═══ RANSOM ═══ */
    const rF = ['Playfair Display, serif','Abril Fatface, serif','Permanent Marker, cursive','Bebas Neue, sans-serif','Rubik Mono One, monospace','Bungee Shade, cursive','Fascinate Inline, cursive','Inter, sans-serif'];
    const rB = [{bg:'#FFE45C',border:'#d4b830',l:false},{bg:'#D42B2B',border:'#a82222',l:true},{bg:'#1a1a1a',border:'#000',l:true},{bg:'#F2F0EC',border:'#d8d4cc',l:false},{bg:'#FFF',border:'#d0d0d0',l:false},{bg:'#FFF0EE',border:'#e8c4be',l:false},{bg:'#E8F5E9',border:'#b8d8b8',l:false}];

    function hexLuma(hex) {
      let h = hex.replace('#','');
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      const r = parseInt(h.substr(0,2),16)/255;
      const g = parseInt(h.substr(2,2),16)/255;
      const b = parseInt(h.substr(4,2),16)/255;
      return 0.299*r + 0.587*g + 0.114*b;
    }

    function ransomify(el) {
      const wk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null); const nodes = []; let nd;
      while (nd = wk.nextNode()) { if (nd.textContent.trim()) nodes.push(nd); }
      nodes.forEach(tN => {
        const txt = tN.textContent, frag = document.createDocumentFragment();
        for (let i = 0; i < txt.length; i++) {
          const ch = txt[i];
          if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
          const font = rF[Math.floor(Math.random()*rF.length)];
          const col = rB[Math.floor(Math.random()*rB.length)];
          const isLight = hexLuma(col.bg) > 0.55;
          const txtColor = isLight ? '#1a1a1a' : '#fff';
          const rot = ((Math.random()-0.5)*10).toFixed(1);
          const cRot = ((Math.random()-0.5)*4).toFixed(1);
          const br = [(2+Math.floor(Math.random()*4)),(3+Math.floor(Math.random()*5)),(2+Math.floor(Math.random()*4)),(3+Math.floor(Math.random()*5))];
          const sp = document.createElement('span'); sp.className = 'ransom-char'; sp.style.transform = 'rotate('+rot+'deg)';
          sp.innerHTML = '<span class="ransom-chip" style="background:'+col.bg+';border-color:'+col.border+';border-radius:'+br[0]+'px '+br[1]+'px '+br[2]+'px '+br[3]+'px;transform:rotate('+cRot+'deg);"></span><span class="ransom-letter" style="font-family:'+font+';color:'+txtColor+';">'+ch+'</span>';
          frag.appendChild(sp);
        }
        tN.parentNode.replaceChild(frag, tN);
      });
    }

    root.querySelectorAll('.stats-strip .num').forEach(el => {
      el.querySelectorAll('.mag-cut').forEach(mc => { const l=mc.querySelector('.mag-letter'); if(l) mc.replaceWith(document.createTextNode(l.textContent)); });
      el.normalize();
      el.querySelectorAll('.highlight-wrap').forEach(hw => { const t=hw.childNodes[0]; if(t&&t.nodeType===3){hw.parentNode.insertBefore(document.createTextNode(t.textContent),hw);hw.remove();} });
      el.normalize(); ransomify(el);
    });

    const heroEm = root.querySelector('.hero h1 em');
    if (heroEm) { heroEm.classList.add('ransom-word'); heroEm.normalize(); ransomify(heroEm); }

    root.querySelectorAll('.features-header h2, .collage-text h2, .team-section > h2, .mission-inner h2').forEach(h => {
      h.querySelectorAll('.mag-cut').forEach(mc => { const l=mc.querySelector('.mag-letter'); if(l) mc.replaceWith(document.createTextNode(l.textContent)); });
      h.normalize();
      const wk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null); let tN = wk.nextNode();
      while (tN && !tN.textContent.trim()) tN = wk.nextNode();
      if (!tN) return;
      const txt = tN.textContent, m = txt.match(/^(\s*)(\S+)(.*)/);
      if (!m) return;
      const ws = document.createElement('span'); ws.className = 'section-ransom-word'; ws.textContent = m[2]; ransomify(ws);
      const frag = document.createDocumentFragment();
      if (m[1]) frag.appendChild(document.createTextNode(m[1]));
      frag.appendChild(ws); frag.appendChild(document.createTextNode(m[3]));
      tN.parentNode.replaceChild(frag, tN);
    });

    /* ═══ SCROLL ═══ */
    let scrollRAF = null;
    const onScroll = () => {
      if (scrollRAF) return;
      scrollRAF = requestAnimationFrame(() => {
        scrollRAF = null;
        const y = window.scrollY, docH = document.documentElement.scrollHeight - window.innerHeight, dir = y - lastScroll;
        currentPct = docH > 0 ? y / docH : 0;
        if (y > 100) { nav.classList.add('nav-shadow'); if (dir > 5) nav.classList.add('nav-hidden'); else if (dir < -5) nav.classList.remove('nav-hidden'); }
        else { nav.classList.remove('nav-shadow','nav-hidden'); }
        lastScroll = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold: 0.15 });
    sections.forEach(s => io.observe(s));

    /* ═══ 3D CARDS ═══ */
    function setup3D(el, inner, maxT, lZ, scl) {
      const emoji = inner.querySelector('.bg-emoji');
      const origTr = inner.style.transform || '';
      let pRAF = null, htCT = null, htRAF = null, eW = 0, eH = 0;
      const ht = mkHT(el);
      const htTgt = {cx:0,cy:0,i:0,sx:1,sy:1}, htCur = {cx:0,cy:0,i:0,sx:1,sy:1};
      let htAct = false;

      function htLoop() {
        if (!htAct) return;
        htCur.cx += (htTgt.cx-htCur.cx)*0.35; htCur.cy += (htTgt.cy-htCur.cy)*0.35;
        htCur.i += (htTgt.i-htCur.i)*0.25; htCur.sx += (htTgt.sx-htCur.sx)*0.25; htCur.sy += (htTgt.sy-htCur.sy)*0.25;
        drawHT(ht, htCur.cx, htCur.cy, htCur.i, eW, eH, htCur.sx, htCur.sy);
        htRAF = requestAnimationFrame(htLoop);
      }
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const nx = ((e.clientX-r.left)-r.width/2)/(r.width/2), ny = ((e.clientY-r.top)-r.height/2)/(r.height/2);
        inner.style.transform = 'perspective(600px) rotateX('+(-ny*maxT)+'deg) rotateY('+(nx*maxT)+'deg) translateZ('+lZ+'px) scale('+scl+')';
        const w = ht.w||100, h = ht.h||100, d = Math.min(Math.sqrt(nx*nx+ny*ny),1);
        const pX = HT_PAD*CV_SC, cW = eW*CV_SC, cH = eH*CV_SC;
        htTgt.cx = w*0.5+(-nx*(cW*0.35+pX*0.5*d)); htTgt.cy = h*0.5+(-ny*(cH*0.35+pX*0.5*d)); htTgt.i = 0.35+d*0.7;
      });
      el.addEventListener('mouseenter', () => {
        if (pRAF) { cancelAnimationFrame(pRAF); pRAF = null; }
        if (htCT) { clearTimeout(htCT); htCT = null; }
        inner.style.transition = 'transform 0.15s ease-out';
        if (emoji) emoji.style.opacity = emoji.dataset.opHover;
        if (!ht.sized) szHT(ht, el);
        const r = el.getBoundingClientRect(); eW = r.width; eH = r.height;
        htAct = true; const w = ht.w||100, h = ht.h||100;
        htCur.cx=w*0.5; htCur.cy=h*0.5; htCur.i=0; htCur.sx=1; htCur.sy=1;
        htTgt.cx=w*0.5; htTgt.cy=h*0.5; htTgt.i=0.4; htTgt.sx=1; htTgt.sy=1;
        if (!htRAF) htRAF = requestAnimationFrame(htLoop);
      });
      el.addEventListener('mouseleave', () => {
        if (pRAF) { cancelAnimationFrame(pRAF); pRAF = null; }
        if (emoji) emoji.style.opacity = emoji.dataset.opDefault;
        const w = ht.w||100, h = ht.h||100;
        htTgt.i=0; htTgt.cx=w*0.5; htTgt.cy=h*0.5; htTgt.sx=1; htTgt.sy=1;
        htCT = setTimeout(() => {
          htCT=null; htAct=false; if(htRAF){cancelAnimationFrame(htRAF);htRAF=null;}
          ht.ctx.clearRect(0,0,ht.w,ht.h); htCur.cx=w*0.5; htCur.cy=h*0.5; htCur.i=0; htCur.sx=1; htCur.sy=1;
        }, 400);
        const start = performance.now(), dur = 450;
        inner.style.transition = 'none';
        function plop(now) {
          const t = Math.min((now-start)/dur,1);
          const spr = t<0.4?(t/0.4):t<0.7?1+Math.sin((t-0.4)/0.3*Math.PI)*-0.06:1+Math.sin((t-0.7)/0.3*Math.PI)*0.02;
          const lift = lZ*(1-spr), sc = 1+(scl-1)*(1-spr);
          inner.style.transform = (origTr?origTr+' ':'')+'perspective(600px) translateZ('+lift+'px) scale('+sc+')';
          if (t<1) pRAF=requestAnimationFrame(plop); else { inner.style.transform=origTr; pRAF=null; }
        }
        pRAF = requestAnimationFrame(plop);
      });
    }

    /* ═══ PAGE RIP (uses React navigate) ═══ */
    const tOvr = document.querySelector('#pageTransition');
    const rPcs = tOvr.querySelectorAll('.rip-piece');
    const rSnp = tOvr.querySelectorAll('.rip-snapshot');
    let tRun = false; const aRAFs = [];

    function trigTrans(e) {
      e.preventDefault();
      if (tRun) return;
      const link = e.currentTarget;
      const route = link.getAttribute('data-route') || link.getAttribute('href') || '/';
      runTrans(() => navigate(route));
    }

    function runTrans(cb) {
      tRun=true; aRAFs.forEach(id => cancelAnimationFrame(id)); aRAFs.length=0;
      tOvr.classList.remove('active');
      rPcs.forEach(p => {p.style.transition='none';p.style.transform='translateY(0)';p.style.opacity='0';});
      const sY=window.scrollY, nE=root.querySelector('#navbar'), pE=root.querySelector('#pageWrapper');
      rSnp.forEach(snap => {snap.innerHTML='';const nc=nE.cloneNode(true);nc.style.position='absolute';nc.style.top='0';nc.style.left='0';nc.style.right='0';nc.style.zIndex='10';nc.id='';const pc=pE.cloneNode(true);pc.style.position='absolute';pc.style.top='0';pc.style.left='0';pc.style.right='0';pc.style.transform='translateY(-'+sY+'px)';pc.id='';pc.querySelectorAll('.scroll-section').forEach(s=>{s.style.opacity='1';s.style.transform='none';s.style.clipPath='none';s.style.filter='none';});[nc,pc].forEach(clone=>{clone.querySelectorAll('*').forEach(el=>{el.style.animation='none';el.style.transition='none';});clone.style.animation='none';clone.style.transition='none';});snap.appendChild(nc);snap.appendChild(pc);});
      tOvr.classList.add('active');
      if(cb) cb();
      requestAnimationFrame(()=>{requestAnimationFrame(()=>{
        rPcs.forEach(p=>{p.style.transition='none';p.style.transform='translateX(0) translateY(0) rotateZ(0deg) rotateX(0deg) scale(1)';p.style.opacity='1';});
        tOvr.offsetHeight;
        rPcs.forEach((p,i)=>{p.style.transition='none';p.style.transform='translateX('+((i-2)*0.5)+'%)';});
        setTimeout(()=>{
          const fp=[{d:0,dr:-8,r:-25,rx:15,fl:12,du:1.1},{d:0,dr:5,r:18,rx:-12,fl:-8,du:1},{d:0,dr:-3,r:-10,rx:20,fl:10,du:1.15},{d:0,dr:7,r:22,rx:-18,fl:-14,du:0.95},{d:0,dr:-6,r:-15,rx:10,fl:9,du:1.05}];
          rPcs.forEach((pc,i)=>{const p=fp[i];const st=performance.now()+p.d;let dn=false;function an(now){if(dn)return;const el=Math.max(0,now-st)/1000;if(el>p.du+0.1){pc.style.opacity='0';dn=true;return;}const t=Math.min(el/p.du,1),g=t*t*135,dr=p.dr*t+p.fl*Math.sin(t*Math.PI*2.5),rZ=p.r*t+Math.sin(t*Math.PI*3)*5,rX=p.rx*Math.sin(t*Math.PI*1.8),sc=1-t*0.15,op=t>0.7?1-((t-0.7)/0.3):1;pc.style.transition='none';pc.style.transform='translateX('+dr+'%) translateY('+g+'vh) rotateZ('+rZ+'deg) rotateX('+rX+'deg) scale('+sc+')';pc.style.opacity=op;aRAFs.push(requestAnimationFrame(an));}aRAFs.push(requestAnimationFrame(an));});
        },0);
        setTimeout(()=>{aRAFs.forEach(id=>cancelAnimationFrame(id));aRAFs.length=0;rPcs.forEach(p=>{p.style.transition='none';p.style.opacity='0';p.style.transform='translateY(200vh)';});tOvr.classList.remove('active');rSnp.forEach(s=>{s.innerHTML='';});tRun=false;},1400);
      });});
    }

    runTransRef.current = runTrans;
    root.querySelectorAll('.btn[data-route]').forEach(link => link.addEventListener('click', trigTrans));


    /* ═══ P5 WEDGE MENU ═══ */
    const p5Trig = root.querySelector('#p5Trigger');
    const p5Back = root.querySelector('#p5Backdrop');
    const p5Ring = root.querySelector('#p5Ring');
    let p5Open = false;

    const P5_LBL = ['Dashboard', 'Dining $', 'Swipes', 'Todays Menu'];
    const P5_ROUTES = ['/dashboard', '/dining-dollars', '/swipes', '/menu'];
    const P5_N = P5_LBL.length;
    const P5_R = 150, P5_SA = -15, P5_EA = 115, P5_XO = -40;

    const p5Svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    p5Svg.setAttribute('width','500'); p5Svg.setAttribute('height','500');
    p5Svg.style.cssText = 'position:absolute;left:-250px;top:-250px;pointer-events:none;z-index:0;overflow:visible;';
    p5Ring.appendChild(p5Svg);

    const p5W = [];
    for (let wi = 0; wi < P5_N; wi++) {
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.style.cursor = 'pointer'; g.style.pointerEvents = 'none';
      g.style.transformOrigin = '250px 250px';
      g.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
      g.dataset.route = P5_ROUTES[wi];
      const pa = document.createElementNS('http://www.w3.org/2000/svg','path');
      pa.setAttribute('fill','#1a1a1a'); pa.setAttribute('stroke','#D42B2B');
      pa.setAttribute('stroke-width','2.5'); pa.setAttribute('stroke-linejoin','round');
      pa.style.opacity = '0'; pa.style.transition = 'fill 0.2s ease, opacity 0.3s ease';
      const tx = document.createElementNS('http://www.w3.org/2000/svg','text');
      tx.textContent = P5_LBL[wi]; tx.setAttribute('fill','#fff');
      tx.setAttribute('font-family',"'Chicle', serif"); tx.setAttribute('font-size','18');
      tx.setAttribute('letter-spacing','0.1em'); tx.setAttribute('text-anchor','middle');
      tx.setAttribute('dominant-baseline','middle'); tx.style.pointerEvents = 'none';
      tx.style.opacity = '0'; tx.style.transition = 'opacity 0.3s ease, font-size 0.2s ease'; tx.style.userSelect = 'none';
      g.appendChild(pa); g.appendChild(tx); p5Svg.appendChild(g);
      p5W.push({ g, path: pa, text: tx });
    }

    const CX = 250, CY = 250;
    for (let ci = 0; ci < P5_N; ci++) {
      const aDeg = P5_SA + (P5_EA - P5_SA) * (ci / (P5_N - 1));
      const aRad = aDeg * Math.PI / 180;
      const wtx = -Math.cos(aRad) * P5_R + P5_XO;
      const wty = Math.sin(aRad) * P5_R + 15;
      const ang = Math.atan2(wty, wtx);
      const dist = Math.sqrt(wtx * wtx + wty * wty);
      const hSpread = Math.atan2(50, dist);
      const reach = dist + 10;
      const baseIn = 22, baseSpread = hSpread * 0.55;
      const x1 = CX + Math.cos(ang - hSpread) * reach, y1 = CY + Math.sin(ang - hSpread) * reach;
      const x2 = CX + Math.cos(ang + hSpread) * reach, y2 = CY + Math.sin(ang + hSpread) * reach;
      const bx1 = CX + Math.cos(ang - baseSpread) * baseIn, by1 = CY + Math.sin(ang - baseSpread) * baseIn;
      const bx2 = CX + Math.cos(ang + baseSpread) * baseIn, by2 = CY + Math.sin(ang + baseSpread) * baseIn;
      p5W[ci].path.setAttribute('d','M '+bx1.toFixed(1)+','+by1.toFixed(1)+' L '+x1.toFixed(1)+','+y1.toFixed(1)+' L '+x2.toFixed(1)+','+y2.toFixed(1)+' L '+bx2.toFixed(1)+','+by2.toFixed(1)+' Z');
      const tDist = dist * 0.58, tX = CX + Math.cos(ang) * tDist, tY = CY + Math.sin(ang) * tDist;
      let tRot = ang * 180 / Math.PI; if (tRot > 90 || tRot < -90) tRot += 180;
      p5W[ci].text.setAttribute('x', tX.toFixed(1)); p5W[ci].text.setAttribute('y', tY.toFixed(1));
      p5W[ci].text.setAttribute('transform', 'rotate('+tRot.toFixed(1)+','+tX.toFixed(1)+','+tY.toFixed(1)+')');
    }

    function posP5() {
      const tr = p5Trig.getBoundingClientRect();
      p5Ring.style.left = (tr.left + tr.width/2) + 'px'; p5Ring.style.top = (tr.top + tr.height/2) + 'px';
      for (let i = 0; i < P5_N; i++) {
        const w = p5W[i];
        if (p5Open) { w.path.style.opacity='1'; w.path.style.transitionDelay=(i*0.05)+'s'; w.text.style.opacity='1'; w.text.style.transitionDelay=(i*0.05+0.08)+'s'; w.g.style.pointerEvents='all'; }
        else { w.path.style.opacity='0'; w.path.style.transitionDelay=((P5_N-1-i)*0.03)+'s'; w.text.style.opacity='0'; w.text.style.transitionDelay='0s'; w.g.style.pointerEvents='none'; w.g.style.transform='scale(1)'; w.path.setAttribute('fill','#1a1a1a'); w.text.setAttribute('font-size','18'); }
      }
    }
    function togP5() { p5Open=!p5Open; p5Trig.classList.toggle('open',p5Open); p5Back.classList.toggle('open',p5Open); posP5(); }
    function closeP5() { if(!p5Open) return; stopPulse(); p5Open=false; p5Trig.classList.remove('open'); p5Back.classList.remove('open'); posP5(); }
    p5Trig.addEventListener('click', e => { e.stopPropagation(); togP5(); });
    p5Back.addEventListener('click', closeP5);

    let pulseRAF2 = null, pulseIdx = -1, pulseStart = 0, reordering = false;
    function stopPulse() { if (pulseRAF2) { cancelAnimationFrame(pulseRAF2); pulseRAF2 = null; } pulseIdx = -1; }
    function runPulse(now) {
      if (pulseIdx < 0) return;
      const elapsed = (now - pulseStart) / 1000, cycle = 1.4, t = elapsed % cycle;
      let scale = 1.0;
      if (t < 0.35) { const p = t / 0.35; if (p < 0.15) scale = 1.0 + 0.06 * (p / 0.15); else { const ease = (p - 0.15) / 0.85; scale = 1.06 * (1 - ease*ease*ease) + 1.0 * (ease*ease*ease); } }
      else if (t < 0.7) { const p2 = (t - 0.35) / 0.35; if (p2 < 0.15) scale = 1.0 + 0.045 * (p2 / 0.15); else { const ease2 = (p2 - 0.15) / 0.85; scale = 1.045 * (1 - ease2*ease2*ease2) + 1.0 * (ease2*ease2*ease2); } }
      p5W[pulseIdx].g.style.transform = 'scale(' + (1.1 + (scale - 1.0)).toFixed(4) + ')';
      pulseRAF2 = requestAnimationFrame(runPulse);
    }

    for (let hi = 0; hi < P5_N; hi++) {
      ((i) => {
        p5W[i].g.addEventListener('mouseenter', () => {
          if (!p5Open) return; if (pulseIdx === i) return; stopPulse();
          for (let j = 0; j < P5_N; j++) p5W[j].g.style.transition = 'none';
          reordering = true;
          const order = []; for (let j = 0; j < P5_N; j++) order.push(j);
          order.sort((a, b) => Math.abs(b - i) - Math.abs(a - i));
          for (let oi = 0; oi < order.length; oi++) p5Svg.appendChild(p5W[order[oi]].g);
          p5Svg.offsetHeight; reordering = false;
          for (let j = 0; j < P5_N; j++) {
            const diff = Math.abs(j - i);
            if (diff === 0) { p5W[j].path.setAttribute('fill','#D42B2B'); p5W[j].text.setAttribute('font-size','21'); }
            else if (diff === 1) { p5W[j].g.style.transform='scale(1.09)'; p5W[j].path.setAttribute('fill','#2d2d2d'); p5W[j].text.setAttribute('font-size','18'); }
            else if (diff === 2) { p5W[j].g.style.transform='scale(1.03)'; p5W[j].path.setAttribute('fill','#222'); p5W[j].text.setAttribute('font-size','18'); }
            else { p5W[j].g.style.transform='scale(1)'; p5W[j].path.setAttribute('fill','#1a1a1a'); p5W[j].text.setAttribute('font-size','18'); }
          }
          pulseIdx = i; pulseStart = performance.now(); pulseRAF2 = requestAnimationFrame(runPulse);
        });
        p5W[i].g.addEventListener('mouseleave', () => {
          if (!p5Open || reordering) return; stopPulse();
          for (let j = 0; j < P5_N; j++) { p5Svg.appendChild(p5W[j].g); p5W[j].g.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)'; }
          p5Svg.offsetHeight;
          for (let j = 0; j < P5_N; j++) { p5W[j].g.style.transform='scale(1)'; p5W[j].path.setAttribute('fill','#1a1a1a'); p5W[j].text.setAttribute('font-size','18'); }
        });
        p5W[i].g.addEventListener('click', () => { closeP5(); runTrans(() => navigate(P5_ROUTES[i])); });
      })(hi);
    }

    const onResize = () => { if (p5Open) posP5(); };
    const onScrollP5 = () => { if (p5Open) posP5(); };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScrollP5, { passive: true });

    /* ═══ INIT 3D ═══ */
    cards3d.forEach(card => setup3D(card, card.querySelector('.card-3d-inner'), 14, 18, 1.05));
    btn3dWraps.forEach(wrap => setup3D(wrap, wrap.querySelector('.btn'), 10, 12, 1.06));

    /* ═══ DOCK MAGNIFY (Team Cards) ═══ */
    const teamGrid = root.querySelector('.team-grid');
    const teamCards = teamGrid ? Array.from(teamGrid.querySelectorAll('.card-3d')) : [];
    const DOCK_MAX_SCALE = 1.10;
    const DOCK_RANGE = 670;

    function dockMagnify(e) {
      const mouseX = e.clientX;
      teamCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCX = rect.left + rect.width / 2;
        const dist = Math.abs(mouseX - cardCX);

        if (dist > DOCK_RANGE) {
          card.style.setProperty('--dock-scale', '1');
          card.style.setProperty('--dock-lift', '0px');
          return;
        }

        const proximity = 1 - (dist / DOCK_RANGE);
        const eased = Math.pow(proximity, 1.3);
        const scale = 1 + (DOCK_MAX_SCALE - 1) * eased;
        const lift = -6 * eased;
        card.style.setProperty('--dock-scale', scale.toFixed(4));
        card.style.setProperty('--dock-lift', lift.toFixed(1) + 'px');
      });
    }

    function dockReset() {
      teamCards.forEach(card => {
        card.style.setProperty('--dock-scale', '1');
        card.style.setProperty('--dock-lift', '0px');
      });
    }

    if (teamGrid) {
      teamGrid.addEventListener('mousemove', dockMagnify);
      teamGrid.addEventListener('mouseleave', dockReset);
    }

    /* ═══ CLEANUP ═══ */
    cleanupRef.current = () => {
      cancelAnimationFrame(waveRAF);
      clearInterval(bgInterval);
      logoIntervals.forEach(id => { clearTimeout(id); clearInterval(id); });
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScrollP5);
      if (teamGrid) { teamGrid.removeEventListener('mousemove', dockMagnify); teamGrid.removeEventListener('mouseleave', dockReset); }
      io.disconnect();
    };

    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, [navigate]);

  const reelImages = [
    "https://huntnewsnu.com/wp-content/uploads/2025/10/IVSteastDiningHalls_5_13_25_ShivWani_9-1-1200x800.jpg",
    "https://news.northeastern.edu/wp-content/uploads/2025/06/061025_MM_Stetson_East_006.jpg?w=1100",
    "https://huntnewsnu.com/wp-content/uploads/2025/05/IVSteastDiningHalls_5_13_25_ShivWani_16.jpg",
    "https://news.northeastern.edu/wp-content/uploads/2018/09/nu_dining_embed.jpg",
    "https://www.pcadesign.com/wp-content/uploads/NU-Curry-Dining_4-1800x1189.jpg",
    "https://news.northeastern.edu/wp-content/uploads/2023/11/111423_AS_Food_Allergies_006.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/International_Village_Dining_Hall.jpg/1920px-International_Village_Dining_Hall.jpg",
    "https://news.northeastern.edu/wp-content/uploads/2023/11/111423_AS_Food_Allergies_004.jpg?w=1100",
  ];

  return (
    <div ref={wrapperRef}>
      <div className="bg-scribbles-layer" id="bgScribbles"></div>
        <svg className="crumple-filter-svg" xmlns="http://www.w3.org/2000/svg">
        <filter id="crumpleWarp"><feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" seed="5" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter>
      </svg>
      <div className="scroll-progress" id="scrollProgress">
        <svg viewBox="0 0 1000 14" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#EC008C"/><stop offset="30%" stopColor="#D4005A"/><stop offset="60%" stopColor="#EC008C"/><stop offset="85%" stopColor="#FFF200"/><stop offset="100%" stopColor="#FFF200"/></linearGradient></defs>
          <path id="sineWavePath" d=""/>
        </svg>
      </div>
      <nav id="navbar">
        <a href="/" className="nav-logo sketch-1" onClick={e => { e.preventDefault(); runTransRef.current?.(() => navigate('/')); }}><span></span> <span className="logo-letters"><span className="logo-char" data-offset="0">S</span><span className="logo-char" data-offset="1">W</span><span className="logo-char" data-offset="2">I</span><span className="logo-char" data-offset="3">P</span><span className="logo-char" data-offset="4">E</span><span className="logo-char" data-offset="5">W</span><span className="logo-char" data-offset="6">I</span><span className="logo-char" data-offset="7">S</span><span className="logo-char" data-offset="8">E</span></span></a>
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <button className="p5-menu-trigger" id="p5Trigger" aria-label="Menu">
            <svg viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg"><path className="morph-crust"/><path className="morph-left"/><path className="morph-right"/></svg>
          </button>
          <a href="/login" className="nav-signin sketch-2" onClick={e => { e.preventDefault(); runTransRef.current?.(() => navigate('/login')); }}>Sign In</a>
        </div>
        <div className="wave-divider"><svg viewBox="0 0 1200 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 C200,18 400,18 600,10 C800,2 1000,2 1200,10 L1200,0 Z"/></svg></div>
      </nav>
      <div className="p5-radial-backdrop" id="p5Backdrop"></div>
      <div className="p5-radial-ring" id="p5Ring"></div>
      <div id="pageWrapper">
        <section className="hero">
          <div className="hero-content">
            <h1 className="sketch-1">Make your<br/><em>dining plan</em><br/><span className="hero-red">actually make sense.</span></h1>
            <p className="sketch-2">Track dining dollars, manage swipes, and discover the best food on campus, all in one place.</p>
            <div className="hero-ctas sketch-3">
              {isLoggedIn
                ? <a href="/dashboard" className="btn btn-white btn-lg zoom-trigger" data-route="/dashboard" onClick={e => { e.preventDefault(); runTransRef.current?.(() => navigate('/dashboard')); }}><span>Go to Dashboard</span></a>
                : <a href="/onboarding" className="btn btn-white btn-lg zoom-trigger" data-route="/onboarding"><span>Let's Start Budgeting</span></a>
              }
              <a href="/menu" className="btn btn-outline btn-lg zoom-trigger" data-route="/menu"><span>Today's Menu →</span></a>
            </div>
          </div>
          <div className="photo-reel-wrapper">
            <div className="photo-reel-strip top"></div>
            <div className="photo-reel-strip bottom"></div>
            <div className="photo-reel" id="photoReel">
              {[...reelImages, ...reelImages].map((src, i) => (
                <div className="reel-frame" key={i}><img src={src} alt="Dining hall"/></div>
              ))}
            </div>
          </div>
        </section>
        <div className="hero-bottom-wave"><svg viewBox="0 0 1200 30" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,0 L1200,0 L1200,15 C1000,28 800,5 600,18 C400,30 200,8 0,20 Z"/></svg></div>
        <section className="stats-strip scroll-section">
          <div className="stats-strip-inner">
            <div className="strip-stat card-3d"  data-tilt="-12" data-hue="120" data-sat="60" data-light="40"><div className="card-3d-inner"><div className="num"><span className="highlight-wrap">$3,820<span className="highlight-bg"></span></span></div><div className="lbl">avg. dining plan cost per sem</div></div></div>
            <div className="strip-stat card-3d"  data-tilt="-6" data-hue="210" data-sat="60" data-light="50"><div className="card-3d-inner"><div className="num"><span className="highlight-wrap">5 mins<span className="highlight-bg"></span></span></div><div className="lbl">to get set up</div></div></div>
            <div className="strip-stat card-3d"  data-tilt="10" data-hue="45" data-sat="70" data-light="50"><div className="card-3d-inner"><div className="num"><span className="highlight-wrap">100%<span className="highlight-bg"></span></span></div><div className="lbl">free to use</div></div></div>
          </div>
        </section>
        <section className="features scroll-section">
          <div className="features-header">
            <h2>Everything you need to eat smarter</h2>
            <p>Stop guessing and start planning. Your dining dollars deserve better.</p>
          </div>
          <div className="features-grid">
            <div className="card-3d"  data-tilt="-8" data-hue="130" data-sat="55" data-light="38"><div className="card-3d-inner feature-card"><h3><span className="highlight-wrap">Dining Dollars Tracker<span className="highlight-bg"></span></span></h3><p>See exactly where your money is going: restaurants, groceries, or on-campus spots. Stay on pace all semester.</p></div></div>
            <div className="card-3d"  data-tilt="6" data-hue="25" data-sat="70" data-light="52"><div className="card-3d-inner feature-card"><h3><span className="highlight-wrap">Swipe Manager<span className="highlight-bg"></span></span></h3><p>Track your weekly swipes, dining hall visits, and outtakes. Never let a swipe go to waste again.</p></div></div>
            <div className="card-3d"  data-tilt="-10" data-hue="48" data-sat="75" data-light="50"><div className="card-3d-inner feature-card"><h3><span className="highlight-wrap">Today's Menu<span className="highlight-bg"></span></span></h3><p>Check out today's dining hall menu across the different dining halls.</p></div></div>
            <div className="card-3d"  data-tilt="12" data-hue="270" data-sat="50" data-light="48"><div className="card-3d-inner feature-card"><h3><span className="highlight-wrap">Pace Tracker<span className="highlight-bg"></span></span></h3><p>Are you spending too fast? Too slow? We'll tell you if you're on track to make it to the end of the semester.</p></div></div>
            <div className="card-3d"  data-tilt="-5" data-hue="170" data-sat="55" data-light="42"><div className="card-3d-inner feature-card"><h3><span className="highlight-wrap">Grocery Planner<span className="highlight-bg"></span></span></h3><p>Optimize your grocery runs against your remaining balance. Build a shopping list that stretches every dollar.</p></div></div>
            <div className="card-3d"  data-tilt="9" data-hue="345" data-sat="60" data-light="52"><div className="card-3d-inner feature-card"><h3><span className="highlight-wrap">Smart Alerts<span className="highlight-bg"></span></span></h3><p>Get notified before you overspend or end the semester with leftover balance you can't use.</p></div></div>
          </div>
        </section>
        <section className="collage-section scroll-section">
          <div className="collage-inner collage-inner--centered">
            <div className="collage-text">
              <h2>Our Mission</h2>
              <p>College dining plans are expensive and confusing. Students consistently overspend early in the semester or waste money at the end. SwipeWise was built to change that, giving every student the clarity to eat well, spend wisely, and enjoy campus food without the stress.</p>
              <a href="/login" className="btn btn-primary zoom-trigger" data-route="/login"><span>Get Started Free</span></a>
            </div>
            {/* TODO: Replace with animation / illustration */}
          </div>
        </section>
        <section className="team-section scroll-section">
          <h2>Meet the Team</h2>
          <p>Students building for students.</p>
          <div className="team-grid">
            {[1,2,3,4,5].map((n,i) => {
              const tilts = [-4,7,-9,6,-3], hues = [215,285,30,160,0], sats = [55,45,60,50,60], lights = [52,50,50,45,50];
              const roles = ['Frontend / Design','Backend / Data Analysis','Product / UX','Backend / Data Analysis','Fullstack'];
              const names = ['Naman Patel', 'Callum Johnson', 'Aarav Gandbhir', 'Tan Matalon', 'Emanuel Galindo Garcia'];
              const photos = [namanPhoto, callumPhoto, aaravPhoto, tanPhoto, emanuelPhoto];
              const githubs = [
                'https://github.com/namanp07',
                'https://github.com/CallumJ25',
                'https://github.com/agandbhir123',
                'https://github.com/tanmatalon',
                'https://github.com/emanuel8006',
              ];
              const linkedins = [
                'https://www.linkedin.com/in/naman-patel-6b8744382/',
                'https://www.linkedin.com/in/callum-johnson-a9a15a235/',
                'https://www.linkedin.com/in/aarav-gandbhir-157902304/',
                'https://www.linkedin.com/in/tanmatalon/',
                'https://www.linkedin.com/in/emanuel-galindo-garcia-657901354/',
              ];
              return <div key={n} className="card-3d"  data-tilt={tilts[i]} data-hue={hues[i]} data-sat={sats[i]} data-light={lights[i]}><div className="card-3d-inner team-card"><div className="team-avatar"><img src={photos[i]} alt={names[i]} /></div><h4><span className="highlight-wrap">{names[i]}<span className="highlight-bg"></span></span></h4><p>{roles[i]}</p><div className="team-socials"><a href={githubs[i]} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg></a><a href={linkedins[i]} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a></div></div></div>;
            })}
          </div>
        </section>
        <section className="mission-section scroll-section">
          <div className="mission-inner">
            <h2>Ready to eat smarter?</h2>
            <p>Take back control NOW. It takes 5 minutes to set up.</p>
            <a href="/login" className="btn btn-white btn-lg zoom-trigger" data-route="/login"><span>Create Free Account →</span></a>
          </div>
        </section>
        <footer className="scroll-section">
          <p>© 2026 SwipeWise &nbsp;&nbsp; <a href="#"></a></p>
        </footer>
      </div>
    </div>
  );
}