# Vivari — Sổ chăm sóc thú cưng ngoại lai (kế hoạch ngắn)

## Nhu cầu thực (nguồn)
- Người nuôi hỗn hợp rắn/ếch/nhện than khó nhớ lần cho ăn, lột xác, cân nặng; đã thử Herpfiles, Reptile Rocket… vẫn đi hỏi: https://www.reddit.com/r/reptiles/comments/1pcpwad/what_app_do_you_use_to_track_your_reptile_care/
- "Chìa khoá là *không* thu phí tháng/năm, chỉ trả 1 lần" + "app hiện có chưa thân thiện như tôi muốn": https://www.reddit.com/r/reptiles/comments/11yrd6l/would_you_use_an_app_like_this/
- Đối thủ khoá từ con thứ 2 sau subscription (Reptile Rocket: 1 con miễn phí; Reptile Keeper $3.99/tháng): https://apps.apple.com/us/app/reptile-rocket-pet-tracker/id1558082005 · https://apps.apple.com/us/app/reptile-keeper-feeding-log/id6815473377
- Dân thuỷ sinh muốn offline-first, không bắt tạo tài khoản: https://www.reddit.com/r/Aquariums/comments/six56l/are_there_any_good_apps_for_managing_and_tracking/

## Ý tưởng chọn
Web app PWA, chạy offline, không tài khoản, dữ liệu ở máy (localStorage), cho **mọi loài** (bò sát, lưỡng cư, chân đốt, chim, cá). Song ngữ Việt/Anh.

## Người dùng
Người nuôi bò sát/exotic nhiều con, breeder nhỏ, trạm cứu hộ, người nuôi cá/chim ở VN và quốc tế.

## MVP (đã build)
- Hồ sơ con vật: tên, loài, nhóm, chu kỳ cho ăn, ghi chú
- Nhật ký: cho ăn (ăn/từ chối), lột xác, cân nặng, vệ sinh, thay nước, thú y, ghi chú
- Màn "Hôm nay": ai đến hạn/quá hạn cho ăn, ghi nhanh 1 chạm
- Biểu đồ cân nặng, thống kê tỉ lệ ăn
- Xuất/nhập JSON, PWA cài lên màn hình, VI/EN
- v2: bách khoa 24 loài, nhắc thông báo, lịch, thống kê, nhật ký ảnh (IndexedDB), nhiệt độ/độ ẩm + cảnh báo, kho mồi, chi phí, ghi nhanh nhiều con, thẻ chia sẻ PNG, giao diện tối

## Kiếm tiền
- Miễn phí ≤3 con; **Pro trả 1 lần** (~$9.99 / 199k) không giới hạn, xuất CSV/PDF, đồng bộ mã hoá.
- Sau: gói breeder (phả hệ, thẻ QR bán con giống), affiliate thức ăn/thiết bị.

## Đối thủ
LizardBox, Reptile Rocket, Reptile Keeper, Exotic Reptile Care, AquaticLog, Aquarimate. Khác biệt: one-time, offline, không tài khoản, đa loài, tiếng Việt.
