import { h, fmt } from '../dom.js';
import { button, toast } from '../components.js';
import { SHOP_ITEMS, canBuy, buy } from '../../core/shop.js';
import { art, bow, ICON, cupcake, teacup } from '../art.js';
import { L } from '../../core/i18n.js';

const ITEM_ART = { freeze: () => bow(), doubleXp: () => teacup(), extraLife: () => cupcake(), hint: () => ICON.bulb() };

let confirming = null;

export function renderShop(s, ctx) {
  const items = SHOP_ITEMS.map((item) => {
    const owned = s.inventory[item.id];
    const check = canBuy(s, item.id);
    const isConfirm = confirming === item.id && check.ok;
    const action = isConfirm
      ? h('div.buy-confirm',
        button(L('Batal', 'Cancel'), { variant: 'ghost', size: 'sm', onClick: () => { confirming = null; ctx.rerender(); } }),
        button(L(`Bayar ${item.price} XP`, `Pay ${item.price} XP`), { variant: 'sun', size: 'sm', onClick: () => {
          confirming = null;
          const res = ctx.update((st) => buy(st, item.id));
          if (res.ok) {
            toast(L(`${item.name} dibeli. Sisa saldo ${fmt(ctx.getState().xp.balance)} XP.`, `${item.name} bought. ${fmt(ctx.getState().xp.balance)} XP left.`), { tone: 'ok' });
            res.unlocked.forEach((a) => toast(L(`Pencapaian terbuka: ${a.name} (+${a.xp} XP)`, `Achievement unlocked: ${a.name} (+${a.xp} XP)`), { tone: 'sun' }));
          } else toast(res.reason);
        } }))
      : button(check.ok ? L('Beli', 'Buy') : L('Belum bisa dibeli', 'Can\'t buy yet'), { variant: check.ok ? 'primary' : 'disabled', size: 'sm', disabled: !check.ok,
        onClick: () => { confirming = item.id; ctx.rerender(); } });

    return h(`article.shop-item.card${check.ok ? '' : '.cant'}`,
      h('span.price-tag', `${item.price} XP`),
      h('div.shop-icon', art(ITEM_ART[item.id] ? ITEM_ART[item.id]() : ICON.star())),
      h('div.shop-text',
        h('h3', item.name),
        h('p', item.desc),
        h('p.small.muted', item.how),
        h('div.owned', Array.from({ length: item.max }, (_, i) => h(`span.pip${i < owned ? '.on' : ''}`)), h('span.small', L(`Dimiliki ${owned}/${item.max}`, `Owned ${owned}/${item.max}`)))),
      h('div.shop-buy', action, check.ok ? null : h('p.small.muted.reason', check.reason)));
  });

  return h('div.screen.shop',
    h('section.boutique-head.frame',
      h('div.awning', { 'aria-hidden': 'true' }),
      h('div.boutique-body', h('span.script', L('Butik kecil', 'Little boutique')), h('h1.display', L('Toko', 'Shop')), h('p.muted', L('Belanjakan XP untuk melindungi streak dan membeli power-up.', 'Spend XP to protect your streak and buy power-ups.'))),
      h('section.wallet',
        h('span.small', L('Saldo XP', 'XP balance')), h('div.wallet-num', art(ICON.star(), 'ico'), fmt(s.xp.balance)),
        h('p.small', L(`Level dihitung dari total XP (${fmt(s.xp.total)}), jadi belanja tidak menurunkan levelmu.`, `Your level comes from total XP (${fmt(s.xp.total)}), so shopping never lowers it.`)))),
    s.boosts.doubleXpLeft > 0 ? h('div.banner.banner-sun', art(ICON.bolt()), h('p', L(`Double XP sedang aktif: ${s.boosts.doubleXpLeft} soal lagi.`, `Double XP is on: ${s.boosts.doubleXpLeft} questions left.`))) : null,
    h('div.shop-list', items));
}
