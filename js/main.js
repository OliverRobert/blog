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
			const pageShare = $('#pageShare')
			const fab = $('#shareFab')
			
			if (!fab || !pageShare) {
				console.warn('[分享功能] 分享元素未找到')
				return
			}
			
			console.log('[分享功能] 初始化开始')
			
			// 分享菜单切换
			const toggleShare = function(e) {
				e.preventDefault()
				e.stopPropagation()
				pageShare.classList.toggle('in')
				console.log('[分享功能] 菜单切换:', pageShare.classList.contains('in') ? '显示' : '隐藏')
			}
			
			// 绑定分享按钮事件
			fab.addEventListener('click', toggleShare, false)
			fab.addEventListener('touchstart', toggleShare, false)
			
			// 点击外部关闭分享菜单
			const closeShare = function(e) {
				if (!fab.contains(e.target) && !pageShare.contains(e.target)) {
					if (pageShare.classList.contains('in')) {
						pageShare.classList.remove('in')
					}
				}
			}
			
			d.addEventListener('click', closeShare, false)
			d.addEventListener('touchstart', closeShare, false)
			
			// 微信分享弹窗
			const wxModal = new this.modal('#wxShare')
			
			// 修复：为每个微信分享按钮绑定事件
			forEach.call($$('.wxFab'), function(el) {
				console.log('[分享功能] 找到微信分享按钮:', el)
				
				const wxToggle = function(e) {
					e.preventDefault()
					e.stopPropagation()
					console.log('[分享功能] 微信分享按钮被点击')
					wxModal.toggle()
				}
				
				// 同时绑定 click 和 touchstart
				el.addEventListener('click', wxToggle, false)
				el.addEventListener('touchstart', wxToggle, false)
			})
			
			console.log('[分享功能] 初始化完成')
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
			const tpl = $('script[data-tpl="page"]')
			if (!tpl) {
				return {
					loaded: noop,
					unload: noop
				}
			}
			const div = d.createElement('div')
			div.innerHTML = tpl.text
			tpl.parentNode.removeChild(tpl)
			return {
				loaded: function() {
					this.visible = true
					forEach.call(div.querySelectorAll('.page-load .tofade'), function(el) {
						el.classList.remove('tofade')
					})
				},
				unload: function() {
					this.visible = false
				}
			}
		}()),
		lightbox: (function() {
			function LightBox(el) {
				this.el = el
				const cpImg = d.createElement('img')
				const mythis = this
				this.img = this.el.querySelector('img')
				this.src = this.img.getAttribute('data-src')
				cpImg.src = this.src
				this.w = cpImg.width
				this.h = cpImg.height
				this.isZoom = false
				if (!this.w || !this.h) {
					cpImg.onload = function() {
						mythis.w = cpImg.width
						mythis.h = cpImg.height
					}
				}
				this.el.addEventListener(even, function(e) {
					if (mythis.isZoom) {
						mythis.zoomOut()
					} else {
						mythis.zoomIn()
					}
					e.preventDefault()
				})
			}
			LightBox.prototype = {
				zoomIn: function() {
					const mythis = this,
						img = this.img,
						winW = w.innerWidth,
						winH = w.innerHeight,
						scaleW = Math.max(winW / this.w, 1),
						scaleH = Math.max(winH / this.h, 1),
						scale = Math.min(scaleW, scaleH),
						pW = this.w * scale,
						pH = this.h * scale,
						imgW = img.width,
						imgH = img.height,
						oW = (winW - pW) / 2,
						oH = (winH - pH) / 2,
						offset = this.el.getBoundingClientRect(),
						offsetX = offset.left,
						offsetY = offset.top,
						middleX = imgW / 2 + offsetX,
						middleY = imgH / 2 + offsetY
					this.isZoom = true
					img.style.cssText = `
						width: ${pW}px;
						height: ${pH}px;
						transform: translate3d(${oW - offsetX}px, ${oH - offsetY}px, 0);
					`
					this.el.classList.add('zoom')
					if (body.clientHeight <= winH) {
						body.classList.add('fix')
					}
					const div = d.createElement('div')
					div.className = 'imgShow'
					div.style.cssText = `
						width: ${winW}px;
						height: ${winH}px;
					`
					div.addEventListener(even, function() {
						mythis.zoomOut()
					})
					body.appendChild(div)
				},
				zoomOut: function() {
					this.isZoom = false
					this.img.style.cssText = ''
					this.el.classList.remove('zoom')
					body.classList.remove('fix')
					const div = d.querySelector('.imgShow')
					if (div) {
						body.removeChild(div)
					}
				}
			}
			if (isPost) {
				const page = $('#post-content')
				const imgs = page.querySelectorAll('img:not(.avatar)')
				forEach.call(imgs, function(el) {
					const src = el.getAttribute('src')
					if (!src) {
						return
					}
					el.setAttribute('data-src', src)
					const a = d.createElement('a')
					a.className = 'img-lightbox'
					a.setAttribute('data-lightbox', 'example-1')
					a.appendChild(el.cloneNode(true))
					el.parentNode.replaceChild(a, el)
				})
				w.addEventListener('scroll', function() {
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
	/* 打开邮箱时,不触发关闭页面事件 */
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
	/* 调整窗口大小时,自动 */
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
	
	if (w.BLOG.SHARE) {
		Blog.share()
	}
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
	
	/* 关键修复：在 Waves 初始化完成后再绑定分享功能 */
	/* 延迟执行避免被 Waves 特效覆盖事件 */
	if (w.BLOG.SHARE) {
		setTimeout(function() {
			Blog.share()
		}, 100)
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
