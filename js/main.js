(function(w, d) {
	const body = d.body,
		$ = d.querySelector.bind(d),
		$$ = d.querySelectorAll.bind(d),
		root = $('html'),
		gotop = $('#gotop'),
		menu = $('#menu'),
		main = $('#main'),
		header = $('#header'),
		mask = $('#mask'),
		menuToggle = $('#menu-toggle'),
		menuOff = $('#menu-off'),
		title = $('.header-title'),
		loading = $('#loading'),
		isPost = location.href.indexOf('post') !== -1,
    isArtitalk = location.href.indexOf('artitalk') !== -1,
    isPhotos = location.href.indexOf('photos') !== -1,
		animate = w.requestAnimationFrame,
		scrollSpeed = 200 / (1000 / 60),
		forEach = Array.prototype.forEach,
		isWX = /micromessenger/i.test(navigator.userAgent),
		noop = function() {},
		offset = function(el) {
			let x = el.offsetLeft,
				y = el.offsetTop
			if (el.offsetParent) {
				const pOfs = arguments.callee(el.offsetParent)
				x += pOfs.x
				y += pOfs.y
			}
			return {
				x: x,
				y: y
			}
		}
	let even =
		'ontouchstart' in w &&
		/Mobile|Android|iOS|iPhone|iPad|iPod|Windows Phone|KFAPWI/i.test(
			navigator.userAgent
		)
			? 'touchstart'
			: 'click'
	let docEl = d.documentElement
	if (w.innerWidth > 600) {
		if (
			(window.navigator.userAgent.indexOf('WOW') > -1 ||
				window.navigator.userAgent.indexOf('Edge') > -1 ||
				window.navigator.userAgent.indexOf('MSIE') > -1) &&
			window.navigator.userAgent.indexOf('Trident') === -1
		) {
			docEl = body
		}
	} else {
		if (window.navigator.userAgent.indexOf('Android') > -1) {
			if (window.navigator.userAgent.indexOf('Browser') > -1) {
				docEl = body
			}
		}
	}
	const Blog = {
		goTop: function(end) {
			const top = docEl.scrollTop
			const interval =
				arguments.length > 2 ? arguments[1] : Math.abs(top - end) / scrollSpeed
			if (top && top > end) {
				docEl.scrollTop = Math.max(top - interval, 0)
				animate(arguments.callee.bind(this, end, interval))
			} else if (end && top < end) {
				docEl.scrollTop = Math.min(top + interval, end)
				animate(arguments.callee.bind(this, end, interval))
			} else {
				this.toc.actived(end)
			}
		},
		toggleGotop: function(top) {
			if (top > w.innerHeight / 2) {
				gotop.classList.add('in')
			} else {
				gotop.classList.remove('in')
			}
		},
		toggleMenu: function(flag) {
			if (flag) {
				menu.classList.remove('hide')
				if (!isPost) {
					main.classList.remove('menuoff')
					jQuery(title).animate({
						marginRight: '-20%'
					})
				}
				if (w.innerWidth < 1241) {
					mask.classList.add('in')
					menu.classList.add('show')

					if (isWX) {
						const top = docEl.scrollTop
						main.classList.add('lock')
						main.scrollTop = top
					} else {
						root.classList.add('lock')
					}
				}
			} else {
				mask.classList.remove('in')
				menu.classList.remove('show')

				if (isWX) {
					const top = main.scrollTop
					main.classList.remove('lock')
					docEl.scrollTop = top
				} else {
					root.classList.remove('lock')
				}
			}
		},
		fixedHeader: function(top) {
			if (top > header.clientHeight) {
				header.classList.add('fixed')
			} else {
				header.classList.remove('fixed')
			}
		},
		toc: (function() {
			const toc = $('#post-toc')
			if (!toc || !toc.children.length) {
				if (isPost) {
					main.classList.add('show')
				}

				return {
					fixed: noop,
					actived: noop
				}
			}
			const bannerH = $('.post-header').clientHeight,
				headerH = header.clientHeight,
				titles = $('#post-content').querySelectorAll('h1, h2, h3, h4, h5, h6')
			toc
				.querySelector(`a[href="#${encodeURI(titles[0].id)}"]`)
				.parentNode.classList.add('active')

			main.classList.add('tocshow')

			title.classList.add('toc')
			$('.footer').classList.add('toc')

			return {
				fixed: function(top) {
					if (top >= bannerH - headerH) {
						toc.classList.add('fixed')
					} else {
						toc.classList.remove('fixed')
					}
				},
				actived: function(top) {
					for (let i = 0, len = titles.length; i < len; i++) {
						if (top > offset(titles[i]).y - headerH - 5) {
							toc.querySelector('li.active').classList.remove('active')
							const active = toc.querySelector(`a[href="#${encodeURI(titles[i].id)}"]`)
								.parentNode
							active.classList.add('active')
						}
					}
					if (top < offset(titles[0]).y) {
						toc.querySelector('li.active').classList.remove('active')
						toc
							.querySelector(`a[href="#${encodeURI(titles[0].id)}"]`)
							.parentNode.classList.add('active')
					}
				}
			}
		}()),
		hideOnMask: [],
		modal: function(target) {
			this.$modal = $(target)
      if (this.$modal === null) {
        return false;
      }
			this.$off = this.$modal.querySelector('.close')
			const mythis = this
			this.show = function() {
				mask.classList.add('in')
				if (w.innerWidth > 800) {
					main.classList.add('Mask')
					menu.classList.add('Mask')
				}
				mythis.$modal.classList.add('ready')
				setTimeout(function() {
					mythis.$modal.classList.add('in')
				}, 0)
			}
			this.onHide = noop
			this.hide = function() {
				mythis.onHide()
				mask.classList.remove('in')
				if (w.innerWidth > 800) {
					main.classList.remove('Mask')
					menu.classList.remove('Mask')
					const myimg = d.querySelector('.imgShow')
					if (myimg) {
						document.body.removeChild(myimg)
					}
				}

				mythis.$modal.classList.remove('in')
				setTimeout(function() {
					mythis.$modal.classList.remove('ready')
				}, 300)
			}
			this.toggle = function() {
				return mythis.$modal.classList.contains('in')
					? mythis.hide()
					: mythis.show()
			}
			Blog.hideOnMask.push(this.hide)
			if (this.$off) {
				this.$off.addEventListener(even, this.hide)
			}
		},
		share: function() {
			const pageShare = $('#pageShare'),
				fab = $('#shareFab'),
				shareModal = new this.modal('#globalShare')
			
			// 调试信息
			if (!fab) {
				console.warn('[分享功能] shareFab元素未找到')
				return
			}
			if (!pageShare) {
				console.warn('[分享功能] pageShare元素未找到')
				return
			}
			
			console.log('[分享功能] 初始化成功，事件类型:', even)
			
			// 创建切换函数
			const toggleShare = function(e) {
				e.preventDefault()
				e.stopPropagation()
				pageShare.classList.toggle('in')
				console.log('[分享功能] 菜单状态切换，当前状态:', pageShare.classList.contains('in') ? '显示' : '隐藏')
			}
			
			// 同时绑定 click 和 touchstart 事件，确保在所有设备上都能工作
			fab.addEventListener('click', toggleShare, false)
			fab.addEventListener('touchstart', toggleShare, false)
			
			// 点击其他地方关闭分享菜单
			const closeShare = function(e) {
				if (!fab.contains(e.target) && !pageShare.contains(e.target)) {
					if (pageShare.classList.contains('in')) {
						pageShare.classList.remove('in')
						console.log('[分享功能] 点击外部区域，关闭菜单')
					}
				}
			}
			
			d.addEventListener('click', closeShare, false)
			d.addEventListener('touchstart', closeShare, false)
			
			// 微信分享功能
			const wxModal = new this.modal('#wxShare')
			wxModal.onHide = shareModal.hide
			forEach.call($$('.wxFab'), function(el) {
				const wxToggle = function(e) {
					e.preventDefault()
					e.stopPropagation()
					wxModal.toggle()
				}
				el.addEventListener('click', wxToggle, false)
				el.addEventListener('touchstart', wxToggle, false)
			})
		},
		reward: function() {
			const modal = new this.modal('#reward')
			const $rewardCode = $('#rewardCode')
      if ($rewardCode === null) {
        return false;
      }
			const $rewardToggle = $('#rewardToggle')
			let tipFirstt = false,
				tipPosition = -1
			const wechatPay = $('.wechatPay')
			const alipayPay = $('.alipayPay')
			const caret = $('.icon-caret-up')
			$('#rewardBtn').addEventListener(even, function() {
				if (tipPosition === -1) {
					$rewardCode.src = $rewardCode.dataset.img
				} else if (tipPosition === 1) {
					$rewardCode.src = $rewardToggle.dataset.alipay
				} else if (tipPosition === 0) {
					$rewardCode.src = $rewardToggle.dataset.wechat
				}
				modal.toggle()
			})

			wechatPay.addEventListener('click', function() {
				tipFirstt = true
			})
			if ($rewardToggle) {
				$rewardToggle.addEventListener('change', function() {
					if (!this.checked) {
						$rewardCode.src = this.dataset.alipay
						alipayPay.classList.add('show')
						wechatPay.classList.remove('show')
						caret.style = 'margin-left:20%;'
						tipPosition = 1
					} else if (!tipFirstt) {
						$rewardCode.src = this.dataset.alipay
						alipayPay.classList.add('show')
						wechatPay.classList.remove('show')
						caret.style = 'margin-left:20%;'
						this.checked = false
						tipPosition = 1
					} else {
						$rewardCode.src = this.dataset.wechat
						alipayPay.classList.remove('show')
						wechatPay.classList.add('show')
						caret.style = 'margin-left:-20%;'
						tipPosition = 0
					}
				})
			}
		},
		tabBar: function(el) {
			el.parentNode.parentNode.classList.toggle('expand')
		},
		page: (function() {
			const $elements = $$('.fade, .fade-scale')
			let visible = false
			return {
				loaded: function() {
					forEach.call($elements, function(el) {
						el.classList.add('in')
					})
					visible = true
				},
				unload: function() {
					forEach.call($elements, function(el) {
						el.classList.remove('in')
					})
					visible = false
				},
				visible: visible
			}
		}()),
		lightbox: (function() {
			function LightBox(element) {
				this.$img = element.querySelector('img')
				this.$overlay = element.querySelector('overlay')
				this.margin = 40
				this.title = this.$img.title || this.$img.alt || ''
				this.isZoom = false
				let naturalW, naturalH, imgRect, docW, docH
				this.calcRect = function() {
					docW = body.clientWidth
					docH = body.clientHeight
					const inH = docH - this.margin * 2
					let ww = naturalW
					let h = naturalH
					const t = this.margin
					const l = 0
					const sw = ww > docW ? docW / ww : 1
					const sh = h > inH ? inH / h : 1
					const s = sw < sh ? sw : sh
					if (s < 1) {
						ww = naturalW * s
						h = naturalH * s
					}
					return {
						w: ww,
						h: h,
						t: (docH - h) / 2,
						l: (docW - ww) / 2
					}
				}
				this.setFrom = function() {
					this.$img.style.cssText = `width: ${imgRect.width}px; height: ${
						imgRect.height
					}px; left: ${imgRect.left}px; top:${imgRect.top}px;`
				}
				this.setTo = function() {
					const rect = this.calcRect()
					this.$img.style.cssText = `width: ${rect.w}px; height: ${rect.h}px; left: ${
						rect.l
					}px; top:${rect.t}px;`
				}
				this.addTitle = function() {
					if (this.title) {
						this.$caption = document.createElement('div')
						this.$caption.innerHTML = this.title
						this.$caption.className = 'overlay-title'
						element.appendChild(this.$caption)
					}
				}
				this.removeTitle = function() {
					if (this.$caption) {
						element.removeChild(this.$caption)
					}
				}
				const mythis = this
				this.zoomIn = function() {
					naturalW = this.$img.naturalWidth || this.$img.width
					naturalH = this.$img.naturalHeight || this.$img.height
					imgRect = this.$img.getBoundingClientRect()
					element.style.height = `${imgRect.height}px`
					element.classList.add('ready')
					this.setFrom()
					this.addTitle()
					this.$img.classList.add('zoom-in')
					setTimeout(function() {
						element.classList.add('active')
						mythis.setTo()
						mythis.isZoom = true
					}, 0)
				}
				this.zoomOut = function() {
					this.isZoom = false
					element.classList.remove('active')
					this.$img.classList.add('zoom-in')
					this.setFrom()
					setTimeout(function() {
						mythis.$img.classList.remove('zoom-in')
						mythis.$img.style.cssText = ''
						mythis.removeTitle()
						element.classList.remove('ready')
						element.removeAttribute('style')
					}, 300)
				}
				element.addEventListener('click', function(e) {
					if (mythis.isZoom) {
						mythis.zoomOut()
					} else if (e.target.tagName === 'IMG') {
						mythis.zoomIn()
					}
				})
				d.addEventListener('scroll', function() {
					if (mythis.isZoom) {
						mythis.zoomOut()
					}
				})
				w.addEventListener('resize', function() {
					if (mythis.isZoom) {
						mythis.zoomOut()
					}
				})
			}
			forEach.call($$('.img-lightbox'), function(el) {
				new LightBox(el)
			})
		}()),
		loadScript: function(scripts) {
			scripts.forEach(function(src) {
				const s = d.createElement('script')
				s.src = src
				s.async = true
				body.appendChild(s)
			})
		}
	}
	/* 页面加载第二个执行的事件 */
	w.addEventListener('load', function() {
		loading.classList.remove('active')
		Blog.page.loaded()
		if (w.lazyScripts && w.lazyScripts.length) {
			Blog.loadScript(w.lazyScripts)
		}
	})
	/* 页面加载第一个执行的事件 */
w.addEventListener('load', function() {
    if (isArtitalk || isPhotos) {
      main.classList.add('menuoff')
    }
    const top = docEl.scrollTop
    Blog.toc.fixed(top)
    Blog.toc.actived(top)
    Blog.page.loaded()
})
	/* 打开邮箱时，不触发关闭页面事件 */
	let ignoreUnload = false
	const $mailTarget = $('a[href^="mailto"]')
	if ($mailTarget) {
		$mailTarget.addEventListener(even, function() {
			ignoreUnload = true
		})
	}
	/* 页面关闭 刷新事件 */
	w.addEventListener('beforeunload', function() {
		if (!ignoreUnload) {
			Blog.page.unload()
		} else {
			ignoreUnload = false
		}
	})
	/* 页面加载第三个执行的事件 */
	w.addEventListener('pageshow', function() {
		if (!Blog.page.visible) {
			Blog.page.loaded()
		}
	})
	/* 调整窗口大小时，自动 */
	w.addEventListener('resize', function() {
		even = 'ontouchstart' in w ? 'touchstart' : 'click'
		w.BLOG.even = even
		Blog.toggleMenu()
	})
	gotop.addEventListener(
		even,
		function() {
			animate(Blog.goTop.bind(Blog, 0))
		},
		false
	)
	menuToggle.addEventListener(
		even,
		function(e) {
			Blog.toggleMenu(true)
			e.preventDefault()
		},
		false
	)
	menuOff.addEventListener(
		even,
		function() {
			menu.classList.add('hide')
			if (!isPost) {
				main.classList.add('menuoff')
				jQuery(title).animate({
					marginRight: '-3%'
				})
			}
		},
		false
	)
	mask.addEventListener(
		even,
		function(e) {
			Blog.toggleMenu()
			Blog.hideOnMask.forEach(function(hide) {
				hide()
			})
			e.preventDefault()
		},
		false
	)
	d.addEventListener(
		'scroll',
		function() {
			const top = docEl.scrollTop
			Blog.toggleGotop(top)
			Blog.fixedHeader(top)
			Blog.toc.fixed(top)
			Blog.toc.actived(top)
		},
		false
	)
/* --- 最终修复方案：强制轮询绑定 (放在文件最末尾) --- */
;(function() {
    console.log('[Fixer] 修复脚本已启动...等待按钮出现');

    var attemptCount = 0;
    var maxAttempts = 20; // 尝试20次 (约10秒)

    function forceBindShare() {
        var fab = document.getElementById('shareFab');
        var pageShare = document.getElementById('pageShare');

        // 1. 如果找不到元素，说明还没加载好
        if (!fab || !pageShare) {
            return false;
        }

        // 2. 防止重复绑定
        if (fab.getAttribute('data-bound') === 'true') {
            return true;
        }

        console.log('[Fixer] 终于找到按钮了！开始执行强制绑定...');

        // 3. 强制提升层级 (CSS 修正)
        if (fab.parentElement) {
            fab.parentElement.style.zIndex = '2147483647'; // 设为最大值
            fab.parentElement.style.position = 'absolute'; 
        }

        // 4. 定义点击逻辑
        var toggleFunc = function(e) {
            console.log('[Fixer] 按钮被点击！');
            // 阻止冒泡，防止被 Waves 或其他特效拦截
            e.preventDefault(); 
            e.stopPropagation();
            
            if (pageShare.classList.contains('in')) {
                pageShare.classList.remove('in');
            } else {
                pageShare.classList.add('in');
            }
        };

        // 5. 绑定事件 (先移除可能存在的旧监听器，再添加新的)
        var newFab = fab.cloneNode(true);
        fab.parentNode.replaceChild(newFab, fab);
        fab = newFab; // 更新引用

        fab.addEventListener('click', toggleFunc, false);
        fab.addEventListener('touchstart', toggleFunc, { passive: false });

        // 6. 点击外部关闭菜单
        document.addEventListener('click', function(e) {
            var target = e.target;
            // 简单的判断：如果点击的不是按钮，也不是菜单内部，就关闭
            if (target !== fab && !fab.contains(target) && target !== pageShare && !pageShare.contains(target)) {
                pageShare.classList.remove('in');
            }
        });

        // 标记已绑定
        fab.setAttribute('data-bound', 'true');
        console.log('[Fixer] ✅ 事件绑定大功告成！');
        return true;
    }

    // 启动轮询：每500ms检查一次
    var timer = setInterval(function() {
        attemptCount++;
        var success = forceBindShare();
        
        if (success) {
            clearInterval(timer); // 成功了，停止轮询
        } else if (attemptCount >= maxAttempts) {
            clearInterval(timer); // 超时了，停止
            console.log('[Fixer] ⚠️ 10秒内未找到按钮，停止尝试。请检查页面是否有 shareFab ID');
        }
    }, 500);

    // 双重保险：在 window load 时也试一次
    window.addEventListener('load', forceBindShare);
})();
	if (w.BLOG.REWARD) {
		Blog.reward()
	}
	Blog.noop = noop
	Blog.even = even
	Blog.$ = $
	Blog.$$ = $$
	Object.keys(Blog).reduce(function(g, e) {
		g[e] = Blog[e]
		return g
	}, w.BLOG)

	if (w.Waves) {
		Waves.init()
		Waves.attach('.global-share li', ['waves-block'])
		Waves.attach('.article-tag-list-link, #page-nav a, #page-nav span', [
			'waves-button'
		])
	} else {
		console.error('Waves loading failed.')
	}
}(window, document))

/*search*/
;(function() {
	const G = window || this,
		even = G.BLOG.even,
		$ = G.BLOG.$,
		searchIco = $('#search'),
		searchWrap = $('#search-wrap'),
		keyInput = $('#key'),
		back = $('#back'),
		searchPanel = $('#search-panel'),
		searchResult = $('#search-result'),
		searchTpl = $('#search-tpl').innerHTML,
		JSON_DATA = `${G.BLOG.ROOT}/content.json`.replace(/\/{2}/g, '/')
	let searchData

	function loadData(success) {
		if (!searchData) {
			const xhr = new XMLHttpRequest()

			xhr.open('GET', JSON_DATA, true)

			xhr.onload = function() {
				if (this.status >= 200 && this.status < 300) {
					const res = JSON.parse(this.response)

					searchData = res instanceof Array ? res : res.posts

					success(searchData)
				} else {
					console.error(this.statusText)
				}
			}

			xhr.onerror = function() {
				console.error(this.statusText)
			}

			xhr.send()
		} else {
			success(searchData)
		}
	}

	function tpl(html, data) {
		return html.replace(/\{\w+\}/g, function(str) {
			const prop = str.replace(/\{|\}/g, '')
			return data[prop] || ''
		})
	}

	const root = $('html')

	const Control = {
		show: function() {
			if (G.innerWidth < 760) {
				root.classList.add('lock-size')
			}
			searchPanel.classList.add('in')
		},
		hide: function() {
			if (G.innerWidth < 760) {
				root.classList.remove('lock-size')
			}
			searchPanel.classList.remove('in')
		}
	}

	function render(data) {
		let html = ''
		if (data.length) {
			html = data
				.map(function(post) {
					return tpl(searchTpl, {
						title: post.title,
						path: `${G.BLOG.ROOT}/${post.path}`.replace(/\/{2,}/g, '/'),
						date: new Date(post.date).toLocaleDateString(),
						tags: post.tags
							.map(function(tag) {
								return `<span>#${tag.name}</span>`
							})
							.join('')
					})
				})
				.join('')
		} else {
			html =
				'<li class="tips"><i class="icon icon-coffee icon-3x"></i><p>Results not found!</p></li>'
		}

		searchResult.innerHTML = html
	}

	function regtest(raw, regExp) {
		regExp.lastIndex = 0
		return regExp.test(raw)
	}

	function matcher(post, regExp) {
		return (
			regtest(post.title, regExp) ||
			post.tags.some(function(tag) {
				return regtest(tag.name, regExp)
			}) ||
			regtest(post.text, regExp)
		)
	}

	function search(e) {
		const key = this.value.trim()
		if (!key) {
			return
		}

		const regExp = new RegExp(key.replace(/[ ]/g, '|'), 'gmi')

		loadData(function(data) {
			const result = data.filter(function(post) {
				return matcher(post, regExp)
			})

			render(result)
			Control.show()
		})

		e.preventDefault()
	}

	searchIco.addEventListener(even, function() {
		searchWrap.classList.toggle('in')
		keyInput.value = ''
		if (searchWrap.classList.contains('in')) {
			keyInput.focus()
		} else {
			keyInput.blur()
		}
	})

	back.addEventListener(even, function() {
		searchWrap.classList.remove('in')
		Control.hide()
	})

	document.addEventListener(even, function(e) {
		if (e.target.id !== 'key' && even === 'click') {
			Control.hide()
		}
	})

	keyInput.addEventListener('input', search)
	keyInput.addEventListener(even, search)
}.call(this))
